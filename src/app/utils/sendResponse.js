export const sendResponse = (res, data) => {
  const extra = data?.extra;
  res.status(data.statusCode).json({
    message: data.message,
    success: data.success,
    statusCode: data.statusCode,
    meta: data.meta,
    data: data.data,
    ...(extra && typeof extra === "object" ? extra : {}),
  });
};
