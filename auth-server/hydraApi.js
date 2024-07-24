const axios = require("axios");
const baseUrl =  process.env.HYDRA_ADMIN_URL;
console.log("HYDRA_ADMIN_URL", baseUrl);
class HydraAPI {

    static async getClients (){
        try {
            const response = await axios.get(baseUrl+'clients');
        return response.data;
        } catch (error) {
            throw new Error(error);
        }
    }

    static getOAuth2LoginRequest = async ({loginChallenge})=>{
        if(!loginChallenge)  throw new Error("no Login challenge");

        try {
            const response = await axios.get(`${baseUrl}oauth2/auth/requests/login?login_challenge=${loginChallenge}`);
            return response;
            } catch (error) {
                console.log(error)
                throw new Error(error);
            }
    }

    static adminGetOAuth2LoginRequest = async (loginChallenge)=>{
        if(!loginChallenge)  throw new Error("no Login challenge");

        try {
            const response = await axios.get(`${baseUrl}oauth2/auth/requests/login?login_challenge=${loginChallenge}`);
            return response;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
    }

    static adminAcceptOAuth2LoginRequest = async (loginChallenge,body)=>{
        if(!loginChallenge)  throw new Error("no Login challenge");

        try {
            const response = await axios.put(`${baseUrl}oauth2/auth/requests/login/accept?login_challenge=${loginChallenge}`, body);
            return response;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
    }

    static adminGetOAuth2ConsentRequest = async (consent)=>{
        if(!consent)  throw new Error("no Login consent");

        try {
            const response = await axios.get(`${baseUrl}oauth2/auth/requests/consent?consent_challenge=${consent}`);
            return response;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
    }

    static adminAcceptOAuth2ConsentRequest = async (consent,body)=>{
        if(!consent)  throw new Error("no Login consent");

        try {
            const response = await axios.put(`${baseUrl}oauth2/auth/requests/consent/accept?consent_challenge=${consent}`, body);
            return response;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
    }

    static introspectToken = async (token, clientId)=>{
        if(!token)  throw new Error("no Login token");
        const body = new URLSearchParams({
            token,
            clientId,
            grant_type:"client_credentials"
        });
        
        try {
            const response = await axios.post(`${baseUrl}/oauth2/introspect`,body.toString(),{
                "Content-Type": "application/x-www-form-urlencoded",
                
            });
            return response;
            } catch (error) {
                console.log(error);
                throw new Error(error);
            }
    }
}
module.exports = HydraAPI;