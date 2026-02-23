export const mapAirline = (data) => {
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    logoUrl: data.logo_url,
  };
};
