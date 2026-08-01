function tenantMiddleware(req, res, next) {
  req.tenantId = req.headers['x-tenant-id'] || 'tenant-jorge-newbery';
  next();
}

module.exports = tenantMiddleware;
