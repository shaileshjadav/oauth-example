// const  { Configuration, OAuth2Api, V0alpha2Api,} = require( "@ory/client");
const { Configuration, PublicApi, AdminApi } = require("@ory/hydra-client");

// const publicApi = new PublicApi(
//   new Configuration({
//     basePath: "https://localhost:5444/",
//   })
// );

const adminApi = new AdminApi(
  new Configuration({
    basePath: "http://localhost:5445/",
  })
);


module.exports= { hydraAdmin: adminApi, publicApi};