const express = require("express");
const app = express();

app.get("/fake-users",(req,res,next)=>{
    return res.json({
        id:1,
        name:"test",
    })
})

const port = 3005 || process.env.port;
app.listen(port,()=>console.log(`node-api is running on port ${port}`));