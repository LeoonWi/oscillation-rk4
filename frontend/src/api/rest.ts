// import axios from "axios";

// const SERVER = "http://localhost:5000";

// export const getStatus = async (): Promise<string> => {
//   const response = await axios.get(`${SERVER}/getStatus`);
//   return response.data.status;
// };

// export const start = async (): Promise<string> => {
//   try {
//     const response = await axios.post(`${SERVER}/start`);
//     return response.data.status;
//   } catch {
//     return "Ошибка";
//   }
// };

// export const pause = async (): Promise<string> => {
//   try {
//     const response = await axios.post(`${SERVER}/pause`);
//     return response.data.status;
//   } catch {
//     return "Ошибка";
//   }
// };

// export const stop = async (): Promise<string> => {
//   try {
//     const response = await axios.post(`${SERVER}/stop`);
//     return response.data.status;
//   } catch {
//     return "Ошибка";
//   }
// };
