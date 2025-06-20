import axios from 'axios';

interface ShopifyConfig {
  shopifyDomain: string;
  apiKey: string;
  apiSecretKey: string;
  accessToken: string;
}

class ShopifyService {
  private config: ShopifyConfig | null = null;
  private backendUrl = ''; // Usar rutas relativas para evitar CORS

  /**
   * Inicializa la configuración desde el backend
   */
  async initialize(): Promise<void> {
    try {
      const response = await axios.get(`${this.backendUrl}/shopifySettings/shop-001`);
      const settings = response.data;
      
      if (!settings) {
        throw new Error('No se encontró la configuración de Shopify');
      }

      if (!settings.shopifyDomain || !settings.accessToken) {
        throw new Error('Configuración de Shopify incompleta');
      }

      this.config = {
        shopifyDomain: settings.shopifyDomain,
        apiKey: settings.apiKey,
        apiSecretKey: settings.apiSecretKey,
        accessToken: settings.accessToken,
      };
    } catch (error) {
      console.error('Error al inicializar Shopify:', error);
      throw error;
    }
  }

  /**
   * Verifica si la configuración está lista
   */
  isConfigured(): boolean {
    return this.config !== null && !!this.config.accessToken;
  }

  /**
   * Obtiene las credenciales actuales
   */
  private async getCredentials(): Promise<{ shopifyDomain: string; accessToken: string }> {
    if (!this.config) {
      await this.initialize();
    }
    
    if (!this.config || !this.config.shopifyDomain || !this.config.accessToken) {
      throw new Error('Configuración de Shopify no disponible');
    }

    return {
      shopifyDomain: this.config.shopifyDomain,
      accessToken: this.config.accessToken,
    };
  }

  /**
   * Prueba la conexión con Shopify
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const credentials = await this.getCredentials();
      
      const response = await axios.post(`${this.backendUrl}/api/shopify/test-connection`, credentials);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || 'Error al conectar con Shopify',
      };
    }
  }

  /**
   * Sincroniza productos desde Shopify
   */
  async syncProducts(): Promise<void> {
    try {
      const credentials = await this.getCredentials();
      
      // Obtener productos de Shopify a través del proxy
      const response = await axios.post(`${this.backendUrl}/api/shopify/products`, credentials);
      
      const products = response.data.products;
      
      // Transformar y guardar en la base de datos local
      for (const product of products) {
        const transformedProduct = {
          shopifyId: product.id.toString(),
          title: product.title,
          handle: product.handle,
          description: product.body_html,
          vendor: product.vendor,
          productType: product.product_type,
          status: product.status,
          tags: product.tags ? product.tags.split(', ') : [],
          images: product.images.map((img: any) => ({
            id: img.id.toString(),
            src: img.src,
            alt: img.alt || '',
          })),
          variants: product.variants.map((variant: any) => ({
            id: variant.id.toString(),
            title: variant.title,
            price: variant.price,
            compareAtPrice: variant.compare_at_price,
            sku: variant.sku,
            inventoryQuantity: variant.inventory_quantity,
          })),
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          publishedAt: product.published_at,
        };

        // Guardar en la base de datos local
        await this.saveProduct(transformedProduct);
      }
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
      throw error;
    }
  }

  /**
   * Sincroniza clientes desde Shopify
   */
  async syncCustomers(): Promise<void> {
    try {
      const credentials = await this.getCredentials();
      
      const response = await axios.post(`${this.backendUrl}/api/shopify/customers`, credentials);
      
      const customers = response.data.customers;
      
      for (const customer of customers) {
        const transformedCustomer = {
          shopifyId: customer.id.toString(),
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone,
          acceptsMarketing: customer.accepts_marketing,
          totalSpent: customer.total_spent,
          ordersCount: customer.orders_count,
          state: customer.state,
          tags: customer.tags ? customer.tags.split(', ') : [],
          note: customer.note,
          verifiedEmail: customer.verified_email,
          taxExempt: customer.tax_exempt,
          currency: customer.currency,
          createdAt: customer.created_at,
          updatedAt: customer.updated_at,
          lastOrderId: customer.last_order_id?.toString(),
          lastOrderName: customer.last_order_name,
          addresses: customer.addresses.map((addr: any) => ({
            id: addr.id.toString(),
            address1: addr.address1,
            address2: addr.address2,
            city: addr.city,
            province: addr.province,
            country: addr.country,
            zip: addr.zip,
            phone: addr.phone,
            default: addr.default,
          })),
        };

        await this.saveCustomer(transformedCustomer);
      }
    } catch (error) {
      console.error('Error al sincronizar clientes:', error);
      throw error;
    }
  }

  /**
   * Sincroniza cupones/descuentos desde Shopify
   */
  async syncCoupons(): Promise<void> {
    try {
      const credentials = await this.getCredentials();
      
      // Obtener reglas de precio (descuentos)
      const priceRulesResponse = await axios.post(`${this.backendUrl}/api/shopify/price-rules`, credentials);
      
      const priceRules = priceRulesResponse.data.price_rules || [];
      
      if (priceRules.length === 0) {
        console.log('No se encontraron cupones en Shopify');
        return;
      }
      
      let syncedCount = 0;
      
      for (const rule of priceRules) {
        try {
          // Obtener códigos de descuento asociados
          const codesResponse = await axios.post(
            `${this.backendUrl}/api/shopify/discount-codes/${rule.id}`,
            credentials
          );
          
          const discountCodes = codesResponse.data.discount_codes || [];
          
          for (const code of discountCodes) {
            const transformedCoupon = {
              shopifyId: code.id.toString(),
              priceRuleId: rule.id.toString(),
              title: rule.title,
              code: code.code,
              status: this.getDiscountStatus(rule),
              discountType: rule.value_type,
              value: Math.abs(parseFloat(rule.value)).toString(),
              appliesTo: rule.target_type,
              minimumRequirement: {
                type: rule.prerequisite_quantity_range ? 'minimum_quantity' : 
                      rule.prerequisite_subtotal_range ? 'minimum_amount' : 'none',
                value: rule.prerequisite_quantity_range?.greater_than_or_equal_to ||
                       rule.prerequisite_subtotal_range?.greater_than_or_equal_to || 0,
              },
              customerEligibility: rule.customer_selection,
              usageLimit: rule.usage_limit,
              oncePerCustomer: rule.once_per_customer,
              usageCount: code.usage_count,
              startsAt: rule.starts_at,
              endsAt: rule.ends_at,
              createdAt: code.created_at,
              updatedAt: code.updated_at,
            };

            await this.saveCoupon(transformedCoupon);
            syncedCount++;
          }
        } catch (codeError) {
          console.error(`Error al obtener códigos para la regla ${rule.id}:`, codeError);
        }
      }
      
      console.log(`Se sincronizaron ${syncedCount} cupones`);
    } catch (error: any) {
      console.error('Error al sincronizar cupones:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Sin permisos para acceder a descuentos. Tu app necesita los permisos read_discounts y read_price_rules en Shopify.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint de descuentos no encontrado. Es posible que no haya descuentos creados o que la API haya cambiado.');
      } else if (error.response?.data?.error) {
        throw new Error(`Error de Shopify: ${error.response.data.error}`);
      }
      
      throw new Error('Error al sincronizar cupones. Verifica la consola para más detalles.');
    }
  }

  /**
   * Determina el estado de un descuento
   */
  private getDiscountStatus(rule: any): string {
    const now = new Date();
    const startsAt = new Date(rule.starts_at);
    const endsAt = rule.ends_at ? new Date(rule.ends_at) : null;

    if (now < startsAt) {
      return 'scheduled';
    } else if (endsAt && now > endsAt) {
      return 'expired';
    } else {
      return 'active';
    }
  }

  /**
   * Guarda un producto en la base de datos local
   */
  private async saveProduct(product: any): Promise<void> {
    try {
      // Verificar si el producto ya existe
      const response = await axios.get(`${this.backendUrl}/shopifyProducts?shopifyId=${product.shopifyId}`);
      
      if (response.data.length > 0) {
        // Actualizar producto existente
        await axios.put(`${this.backendUrl}/shopifyProducts/${response.data[0].id}`, product);
      } else {
        // Crear nuevo producto
        await axios.post(`${this.backendUrl}/shopifyProducts`, {
          ...product,
          id: `sp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  }

  /**
   * Guarda un cliente en la base de datos local
   */
  private async saveCustomer(customer: any): Promise<void> {
    try {
      const response = await axios.get(`${this.backendUrl}/shopifyCustomers?shopifyId=${customer.shopifyId}`);
      
      if (response.data.length > 0) {
        await axios.put(`${this.backendUrl}/shopifyCustomers/${response.data[0].id}`, customer);
      } else {
        await axios.post(`${this.backendUrl}/shopifyCustomers`, {
          ...customer,
          id: `sc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  }

  /**
   * Guarda un cupón en la base de datos local
   */
  private async saveCoupon(coupon: any): Promise<void> {
    try {
      const response = await axios.get(`${this.backendUrl}/shopifyCoupons?shopifyId=${coupon.shopifyId}`);
      
      if (response.data.length > 0) {
        await axios.put(`${this.backendUrl}/shopifyCoupons/${response.data[0].id}`, coupon);
      } else {
        await axios.post(`${this.backendUrl}/shopifyCoupons`, {
          ...coupon,
          id: `scp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        });
      }
    } catch (error) {
      console.error('Error al guardar cupón:', error);
    }
  }

  /**
   * Crea un nuevo cupón en Shopify
   */
  async createCoupon(couponData: {
    title: string;
    code: string;
    discountType: 'fixed_amount' | 'percentage';
    value: number;
    appliesTo: 'all' | 'specific_products' | 'specific_collections';
    productIds?: string[];
    collectionIds?: string[];
    minimumAmount?: number;
    minimumQuantity?: number;
    customerEligibility: 'all' | 'specific_customers' | 'customer_groups';
    customerIds?: string[];
    usageLimit?: number;
    oncePerCustomer?: boolean;
    startsAt?: string;
    endsAt?: string;
  }): Promise<any> {
    try {
      const credentials = await this.getCredentials();
      
      // Preparar la regla de precio
      const priceRule: any = {
        title: couponData.title,
        target_type: couponData.appliesTo === 'all' ? 'line_item' : 
                     couponData.appliesTo === 'specific_products' ? 'line_item' : 'line_item',
        target_selection: couponData.appliesTo === 'all' ? 'all' : 'entitled',
        allocation_method: 'across',
        value_type: couponData.discountType,
        value: `-${couponData.value}`,
        customer_selection: couponData.customerEligibility,
        starts_at: couponData.startsAt || new Date().toISOString(),
      };

      // Configurar fecha de fin si se proporciona
      if (couponData.endsAt) {
        priceRule.ends_at = couponData.endsAt;
      }

      // Configurar límite de uso
      if (couponData.usageLimit) {
        priceRule.usage_limit = couponData.usageLimit;
      }

      // Configurar una vez por cliente
      if (couponData.oncePerCustomer) {
        priceRule.once_per_customer = true;
      }

      // Configurar requisitos mínimos
      if (couponData.minimumAmount) {
        priceRule.prerequisite_subtotal_range = {
          greater_than_or_equal_to: couponData.minimumAmount.toString()
        };
      } else if (couponData.minimumQuantity) {
        priceRule.prerequisite_quantity_range = {
          greater_than_or_equal_to: couponData.minimumQuantity
        };
      }

      // Configurar productos o colecciones específicas
      if (couponData.appliesTo === 'specific_products' && couponData.productIds) {
        priceRule.entitled_product_ids = couponData.productIds;
      } else if (couponData.appliesTo === 'specific_collections' && couponData.collectionIds) {
        priceRule.entitled_collection_ids = couponData.collectionIds;
      }

      // Configurar clientes específicos
      if (couponData.customerEligibility === 'specific_customers' && couponData.customerIds) {
        priceRule.prerequisite_customer_ids = couponData.customerIds;
      }

      // 1. Crear la regla de precio
      const priceRuleResponse = await axios.post(
        `${this.backendUrl}/api/shopify/price-rules/create`,
        {
          ...credentials,
          priceRule
        }
      );

      const createdPriceRule = priceRuleResponse.data.price_rule;

      // 2. Crear el código de descuento
      const discountCodeResponse = await axios.post(
        `${this.backendUrl}/api/shopify/price-rules/${createdPriceRule.id}/discount-codes`,
        {
          ...credentials,
          discountCode: couponData.code
        }
      );

      const createdDiscountCode = discountCodeResponse.data.discount_code;

      // 3. Guardar en la base de datos local
      const transformedCoupon = {
        shopifyId: createdDiscountCode.id.toString(),
        priceRuleId: createdPriceRule.id.toString(),
        title: createdPriceRule.title,
        code: createdDiscountCode.code,
        status: this.getDiscountStatus(createdPriceRule),
        discountType: createdPriceRule.value_type,
        value: Math.abs(parseFloat(createdPriceRule.value)).toString(),
        appliesTo: createdPriceRule.target_type,
        minimumRequirement: {
          type: createdPriceRule.prerequisite_quantity_range ? 'minimum_quantity' : 
                createdPriceRule.prerequisite_subtotal_range ? 'minimum_amount' : 'none',
          value: createdPriceRule.prerequisite_quantity_range?.greater_than_or_equal_to ||
                 createdPriceRule.prerequisite_subtotal_range?.greater_than_or_equal_to || 0,
        },
        customerEligibility: createdPriceRule.customer_selection,
        usageLimit: createdPriceRule.usage_limit,
        oncePerCustomer: createdPriceRule.once_per_customer,
        usageCount: 0,
        startsAt: createdPriceRule.starts_at,
        endsAt: createdPriceRule.ends_at,
        createdAt: createdDiscountCode.created_at,
        updatedAt: createdDiscountCode.updated_at,
      };

      await this.saveCoupon(transformedCoupon);

      return {
        success: true,
        priceRule: createdPriceRule,
        discountCode: createdDiscountCode,
        localCoupon: transformedCoupon
      };

    } catch (error: any) {
      console.error('Error al crear cupón:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.error || 'Error al crear el cupón en Shopify');
      }
      
      throw error;
    }
  }
}

export const shopifyService = new ShopifyService();
