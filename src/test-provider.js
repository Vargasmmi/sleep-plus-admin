// Archivo de prueba para verificar la estructura de datos
// Este archivo puede ser eliminado después de las pruebas

import dataProvider from "@refinedev/simple-rest";

const API_URL = "http://localhost:3001";
const provider = dataProvider(API_URL);

// Test getList for evaluations
provider.getList({
  resource: "evaluations",
  pagination: { current: 1, pageSize: 10 },
  sorters: [],
  filters: [],
}).then(result => {
  console.log("Evaluations result:", result);
}).catch(error => {
  console.error("Evaluations error:", error);
});

// Test getList for campaigns
provider.getList({
  resource: "campaigns",  
  pagination: { current: 1, pageSize: 10 },
  sorters: [],
  filters: [],
}).then(result => {
  console.log("Campaigns result:", result);
}).catch(error => {
  console.error("Campaigns error:", error);
});
