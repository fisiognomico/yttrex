const _ = require('lodash');
const expect    = require("chai").expect;
const nconf = require("nconf");
const moment = require("moment");

const youchoose = require('../../routes/youchoose');

nconf.argv().env().file({ file: "config/settings.json" });

const TMPRWRKR = 'UCbaf8gVrbDzolaeMtP3-XhA';

/* This first check the capacity of load data and verify they are avail */
describe("Testing the token request", function() {

  /*| this below is the request expected in 
    | routes/youchoose.js creatorRegister
    | /api/v3/creator/:channelId/register */
  const registerRequest = {
    body: {
      type: "channel",
    },
    params: {
      channelId: TMPRWRKR,
    }
  };

  /* the "register" causes one thing:
   - it is produced a verificationToken, which has to go 
     into the channel description.
   - server side a channelId can only have ONE verificationToken per time */

  it("Request a token", async function() {
    const result = await youchoose.creatorRegister(registerRequest);
    expect(result.json.token).to.be.a("string");
    expect(result.json.token.length).to.be.equal(40)
    expect(result.json.tokenString).to.be.a("string");
    verificationToken = _.get(result.json, 'token');

    /* this should happen */
    if(result.json.token) {
      const url = `https://www.youtube.com/channel/${result.json.channelId}/about`;
      const what = `This string ${result.json.tokenString} should be copied in the description of ${url}`;
      console.log(what);
    }
  }).timeout(10000);

  it("The creator should not be verified yet (test by Token)", async function() {
    /* by invoking creatorGet a creator would retrieved 
     * information on their channel. The filter might be 
     * composed by verificationToken or by channelId, and 
     * must be in the header */
    const result = await youchoose.creatorGet({
      headers: {
        verificationToken: "e6d09bc0bdbeabe21da5d617aae43d8f5af72109",
      }
    });
    expect(result.json.verified).to.be.false;
  }).timeout(10000);

  it("The creator should not be verified yet (test by Channel)", async function() {
    const result = await youchoose.creatorGet({
      headers: {
        channelId: TMPRWRKR,
      }
    });
    expect(result.json.verified).to.be.false;
  }).timeout(10000);

  it("Invoke verification", async function() {
    const result = await youchoose.creatorVerify({
      params: {
        channelId: registerRequest.params.channelId
      }
    });
    expect(result.json.username).to.be.equal('temporaryworkaround');
  }).timeout(10000);

  it("Test creator/me when validated", async function() {
    const result = await youchoose.creatorGet({
      headers: {
        channelId: TMPRWRKR,
      }
    });
    expect(result.json.verified).to.be.true;
  }).timeout(4000);
});
