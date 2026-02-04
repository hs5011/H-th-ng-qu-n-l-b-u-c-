
// File đã được gỡ bỏ theo yêu cầu của người dùng để sử dụng dữ liệu nội bộ LocalStorage
export const GoogleSheetsService = {
  diagnoseSystem: async () => ({ sheetsApiEnabled: true }),
  testConnection: async () => ({ ok: true }),
  getSheetData: async () => []
};
