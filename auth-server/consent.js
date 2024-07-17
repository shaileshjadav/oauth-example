const express = require("express");

const url = require("url");
const HydraAPI = require(".//hydraApi");


const router = express.Router();

router.get("/", (req, res, next) => {
    const query = url.parse(req.url, true).query

    const challenge = String(query.consent_challenge)
    if (!challenge) {
        next(new Error("Expected a consent challenge to be set but received none."))
        return
    }


    // This section processes consent requests and either shows the consent UI or
  // accepts the consent request right away if the user has given consent to this
  // app before
  HydraAPI
  .adminGetOAuth2ConsentRequest(challenge)
  // This will be called if the HTTP request was successful
  .then(({ data: body }) => {

    // If a user has granted this application the requested scope, hydra will tell us to not show the UI.
    // Any cast needed because the SDK changes are still unreleased.
    // TODO: Remove in a later version.
    if (body.skip || (body.client)?.skip_consent) {
      // You can apply logic here, for example grant another scope, or do whatever...
      // ...

      // Now it's time to grant the consent request. You could also deny the request if something went terribly wrong
      return HydraAPI
        .adminAcceptOAuth2ConsentRequest(challenge, {
          // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
          // are requested accidentally.
          grant_scope: body.requested_scope,

          // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
          grant_access_token_audience: body.requested_access_token_audience,

          // The session allows us to set session data for id and access tokens
          session: {
            // This data will be available when introspecting the token. Try to avoid sensitive information here,
            // unless you limit who can introspect tokens.
            access_token: {
              // foo: 'bar'
              userId:123,
            },
          },
          
        })
        .then(({ data: body }) => {
          // All we need to do now is to redirect the user back to hydra!
          res.redirect(String(body.redirect_to))
        })
    }

    // If consent can't be skipped we MUST show the consent UI.
    res.render("consent", {
      challenge: challenge,
      // We have a bunch of data available from the response, check out the API docs to find what these values mean
      // and what additional data you have available.
      requested_scope: body.requested_scope,
      user: body.subject,
      client: body.client,
    //   action: urljoin(process.env.BASE_URL || "", "/consent"),
      action:  "/consent",
    })
  })
  // This will handle any error that happens when making HTTP calls to hydra
  .catch(next)
// The consent request has now either been accepted automatically or rendered.
});

router.post("/", (req, res, next) => {
    // The challenge is now a hidden input field, so let's take it from the request body instead
    const challenge = req.body.challenge
  
    // Let's see if the user decided to accept or reject the consent request..
    if (req.body.submit === "Deny access") {
      // Looks like the consent request was denied by the user
      return (
        hydraAdmin
          .adminRejectOAuth2ConsentRequest(challenge, {
            error: "access_denied",
            error_description: "The resource owner denied the request",
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the browser back to hydra!
            res.redirect(String(body.redirect_to))
          })
          // This will handle any error that happens when making HTTP calls to hydra
          .catch(next)
      )
    }
    // label:consent-deny-end
  
    let grantScope = req.body.grant_scope
    if (!Array.isArray(grantScope)) {
      grantScope = [grantScope]
    }
  
    // The session allows us to set session data for id and access tokens
    let session = {
      // This data will be available when introspecting the token. Try to avoid sensitive information here,
      // unless you limit who can introspect tokens.
      access_token: {
        // foo: 'bar'
        userId:123,
      },
  
      // This data will be available in the ID token.
      id_token: {
        // baz: 'bar'
        email: "foo@bar.com",
        email_verified:true,
        },
    }
      // If the phone scope was granted, fake the phone claims.
    if (grantScope.indexOf("phone") > -1) {
        session.idToken.phone_number = "1337133713371337"
        session.idToken.phone_number_verified = true
    }
    // Here is also the place to add data to the ID or access token. For example,
    // if the scope 'profile' is added, add the family and given name to the ID Token claims:
    // if (grantScope.indexOf('profile')) {
    //   session.id_token.family_name = 'Doe'
    //   session.id_token.given_name = 'John'
    // }
  
    // Let's fetch the consent request again to be able to set `grantAccessTokenAudience` properly.
    HydraAPI
      .adminGetOAuth2ConsentRequest(challenge)
      // This will be called if the HTTP request was successful
      .then(({ data: body }) => {
        return HydraAPI
          .adminAcceptOAuth2ConsentRequest(challenge, {
            // We can grant all scopes that have been requested - hydra already checked for us that no additional scopes
            // are requested accidentally.
            grant_scope: grantScope,
  
            // If the environment variable CONFORMITY_FAKE_CLAIMS is set we are assuming that
            // the app is built for the automated OpenID Connect Conformity Test Suite. You
            // can peak inside the code for some ideas, but be aware that all data is fake
            // and this only exists to fake a login system which works in accordance to OpenID Connect.
            //
            // If that variable is not set, the session will be used as-is.
            session,
  
            // ORY Hydra checks if requested audiences are allowed by the client, so we can simply echo this.
            grant_access_token_audience: body.requested_access_token_audience,
  
            // This tells hydra to remember this consent request and allow the same client to request the same
            // scopes from the same user, without showing the UI, in the future.
            remember: Boolean(req.body.remember),
  
            // When this "remember" sesion expires, in seconds. Set this to 0 so it will never expire.
            remember_for: 3600,
          })
          .then(({ data: body }) => {
            // All we need to do now is to redirect the user back to hydra!
            res.redirect(String(body.redirect_to))
          })
      })
      // This will handle any error that happens when making HTTP calls to hydra
      .catch(next)
    // label:docs-accept-consent
})

// check token expired or by using this route
router.get("/check",async (req,res,next)=>{
  const clientId = process.env.NODE_APP_CLIENT_ID;
  // token can be access token or refresh token of user
  // Note: Here for example used static token, change
  HydraAPI
  .introspectToken("WU1qpIWt8_MaBPs9nqO5_SfVVYlE-0K1Sy6HPImkD7M.PBSnhlCDa-RPu-0F-_l0F3dCyo1SnMaaA2AtNgQc__U", clientId)
  // This will be called if the HTTP request was successful
  .then(({ data: body }) => {
    res.send(body);
  }).catch(e=>res.send(e))
  });
module.exports = router;