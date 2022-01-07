(()=>{var e={389:(e,s,t)=>{const r=t(667),o=t(185);o.connect(process.env.MONGO_DB_KEY).catch((e=>{console.error("Failed to connect to MongoDB..."),r.showError(e)}));const i=o.connection;i.once("open",(()=>console.log("Connected to MongoDB!"))),i.on("error",r.showError);const a=t(860),n=a();n.use(((e,s,t)=>{s.setHeader("Access-Control-Allow-Origin","*"),s.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),s.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE"),"OPTIONS"!==e.method?t():s.sendStatus(200)})),n.use("/images",a.static("images")),n.use(a.json());const u=t(327),c=t(616);n.use("/api/auth",u),n.use("/api/sauces",c),e.exports=n},36:(e,s,t)=>{const r=t(147),o=t(10),i=(e,s)=>{e.likes--,e.usersLiked.splice(e.usersLiked.indexOf(s),1)},a=(e,s)=>{e.dislikes--,e.usersDisliked.splice(e.usersDisliked.indexOf(s),1)},n=(e,s)=>e.usersLiked.find((e=>e===s)),u=(e,s)=>e.usersDisliked.find((e=>e===s));s.getAllSauces=(e,s)=>{o.find().then((e=>s.status(200).json(e))).catch((e=>s.status(400).json({error:e})))},s.createSauce=(e,s)=>{const t=JSON.parse(e.body.sauce);t.userId=s.locals.userId,new o({...t,imageUrl:`${e.protocol}://${e.get("host")}/images/${e.file.filename}`,likes:0,dislikes:0,usersLiked:[],usersDisliked:[]}).save().then((()=>s.status(201).json({message:"Sauce enregistrée !"}))).catch((e=>s.status(400).json({error:e})))},s.getOneSauce=(e,s)=>{s.status(200).json(s.locals.sauce)},s.updateSauce=(e,s)=>{const t=s.locals.sauce;if(e.file){const i={...JSON.parse(e.body.sauce),imageUrl:`${e.protocol}://${e.get("host")}/images/${e.file.filename}`},a=t.imageUrl.split("/images/")[1];r.unlink(`images/${a}`,(()=>{o.updateOne({_id:t._id},i).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})))}))}else{const r={...e.body};o.updateOne({_id:t._id},r).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})))}},s.deleteSauce=(e,s)=>{const t=s.locals.sauce,i=t.imageUrl.split("/images/")[1];r.unlink(`images/${i}`,(()=>{o.deleteOne({_id:t._id}).then((()=>s.status(200).json({message:"Sauce supprimée !"}))).catch((e=>s.status(500).json({error:e})))}))},s.likeSauce=(e,s)=>{const t=s.locals.userId,r=s.locals.sauce;switch(e.body.like){case 1:if(n(r,t))return s.status(400).json({message:"Sauce déjà likée..."});u(r,t)&&a(r,t),((e,s)=>{e.likes++,e.usersLiked.push(s)})(r,t);break;case-1:if(u(r,t))return s.status(400).json({message:"Sauce déjà dislikée..."});n(r,t)&&i(r,t),((e,s)=>{e.dislikes++,e.usersDisliked.push(s)})(r,t);break;case 0:case 0:n(r,t)?i(r,t):u(r,t)&&a(r,t)}o.updateOne({_id:r._id},r).then((()=>s.status(200).json({message:"Sauce likée !"}))).catch((e=>s.status(500).json({error:e})))}},612:(e,s,t)=>{const r=t(96),o=t(344),i=t(862);s.signup=async(e,s)=>{try{const t=await r.hash(e.body.password,10),o=new i({email:e.body.email,password:t});await o.save(),s.status(201).json({message:"Utilisateur créé !"})}catch(e){"User validation failed"===e._message?s.status(400).json({message:"Email déjà utilisé..."}):s.status(500).json({error:e})}},s.login=async(e,s)=>{try{const t=await i.findOne({email:e.body.email});if(!t)return s.status(400).json({message:"Utilisateur non trouvé..."});if(!await r.compare(e.body.password,t.password))return s.status(401).json({message:"Mot de passe incorrect..."});s.status(200).json({userId:t._id,token:o.sign({userId:t._id},process.env.TOKEN_SECRET_KEY,{expiresIn:"24h"})})}catch(e){s.status(500).json({error:e})}}},667:(e,s)=>{s.showError=e=>{console.error(),console.error(e),console.error()}},752:(e,s,t)=>{const r=t(344);s.token=(e,s,t)=>{try{const o=e.headers.authorization?.split(" ")[1],i=r.verify(o,process.env.TOKEN_SECRET_KEY);s.locals.userId=i.userId,t()}catch(e){s.status(401).json({error:e})}},s.sauce=(e,s,t)=>{const r=s.locals.userId;if(s.locals.sauce.userId!==r)return s.status(403).json({message:"Sauce non possédée..."});t()}},204:(e,s,t)=>{const r=t(738),o={"image/jpg":"jpg","image/jpeg":"jpg","image/png":"png"},i=r.diskStorage({destination:(e,s,t)=>{t(null,"images")},filename:(e,s,t)=>{const r=o[s.mimetype];t(null,`${Date.now()}.${r}`)}});e.exports=r({storage:i}).single("image")},10:(e,s,t)=>{const r=t(185),o=r.Schema({userId:{type:String,required:!0,immutable:!0},name:{type:String,required:!0},manufacturer:{type:String,required:!0},description:{type:String,required:!0},mainPepper:{type:String,required:!0},imageUrl:{type:String,required:!0},heat:{type:Number,required:!0},likes:{type:Number,required:!0},dislikes:{type:Number,required:!0},usersLiked:{type:[String],required:!0},usersDisliked:{type:[String],required:!0}});e.exports=r.model("Sauce",o)},862:(e,s,t)=>{const r=t(185),o=t(288),i=r.Schema({email:{type:String,required:!0,unique:!0},password:{type:String,required:!0}});i.plugin(o),e.exports=r.model("User",i)},616:(e,s,t)=>{const r=t(860).Router(),o=t(752),i=t(204),a=t(10),n=t(36);r.use(o.token),r.route("/").get(n.getAllSauces).post(i,n.createSauce),r.route("/:id").get(n.getOneSauce).put(o.sauce,i,n.updateSauce).delete(o.sauce,n.deleteSauce),r.post("/:id/like",n.likeSauce),r.param("id",(async(e,s,t,r)=>{try{const e=await a.findOne({_id:r});if(!e)return s.status(400).json({message:"Sauce introuvable..."});s.locals.sauce=e,t()}catch(e){s.status(500).json({error:e})}})),e.exports=r},327:(e,s,t)=>{const r=t(860).Router(),o=t(612);r.post("/signup",o.signup),r.post("/login",o.login),e.exports=r},96:e=>{"use strict";e.exports=require("bcrypt")},142:e=>{"use strict";e.exports=require("dotenv")},860:e=>{"use strict";e.exports=require("express")},344:e=>{"use strict";e.exports=require("jsonwebtoken")},185:e=>{"use strict";e.exports=require("mongoose")},288:e=>{"use strict";e.exports=require("mongoose-unique-validator")},738:e=>{"use strict";e.exports=require("multer")},147:e=>{"use strict";e.exports=require("fs")},685:e=>{"use strict";e.exports=require("http")}},s={};function t(r){var o=s[r];if(void 0!==o)return o.exports;var i=s[r]={exports:{}};return e[r](i,i.exports,t),i.exports}(()=>{t(142).config();const e=t(667),s=t(685),r=t(389),o=s.createServer(r);o.on("error",(e=>{const s=`Port ${e.port}`;switch(e.code){case"EACCES":console.error(s+" requires elevated privileges.");break;case"EADDRINUSE":console.error(s+" is already in use.")}process.exit(1)})),o.on("listening",(()=>console.log(`Listening on port ${o.address().port}!`)));try{o.listen(process.env.PORT||3e3)}catch(s){"ERR_SOCKET_BAD_PORT"===s.code?console.error("Port should be >= 0 and < 65536."):e.showError(s),process.exit(1)}})()})();