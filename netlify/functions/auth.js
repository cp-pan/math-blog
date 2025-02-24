const axios = require('axios');

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  const clientId = 'Ov23liLLGiVy6pYRp1LK';      // 替换为你的 Client ID
  const clientSecret = '6358922667fdb0099b0b9019a19dce16846c7c5b'; // 替换为你的 Client Secret

  try {
    // 1. 获取 GitHub Access Token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2. 获取用户信息
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });

    // 3. 返回 Token 和用户信息给前端
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: accessToken,
        user: userResponse.data.login,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '登录失败' }),
    };
  }
};
