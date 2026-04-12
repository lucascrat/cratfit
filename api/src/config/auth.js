module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: '30d',   // longo — usuário fica logado por 30 dias sem precisar de refresh
    refreshTokenExpiry: '90d',  // refresh válido por 90 dias
    bcryptRounds: 12,
};
