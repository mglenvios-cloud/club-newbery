async function provisionNewClub(clubData) {
  return {
    success: true,
    tenantId: `tenant-${Date.now()}`,
    data: clubData,
  };
}

module.exports = {
  provisionNewClub,
};
