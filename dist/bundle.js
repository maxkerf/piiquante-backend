(()=>{var e={389:(e,s,r)=>{const t=r(860),o=r(185),i=r(327),a=r(616);o.connect(process.env.MONGO_DB_KEY,{useNewUrlParser:!0,useUnifiedTopology:!0}).then((()=>console.log("Connexion à MongoDB réussie !"))).catch((()=>console.error('Connexion à MongoDB échouée...\nVeuillez consulter le fichier "README.md" pour plus d\'informations.')));const n=t();n.use(((e,s,r)=>{s.setHeader("Access-Control-Allow-Origin","*"),s.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),s.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE"),"OPTIONS"!==e.method?r():s.sendStatus(200)})),n.use("/images",t.static("images")),n.use(t.json()),n.use("/api/auth",i),n.use("/api/sauces",a),e.exports=n},36:(e,s,r)=>{const t=r(147),o=r(10),i=(e,s)=>{e.likes--,e.usersLiked.splice(e.usersLiked.indexOf(s),1)},a=(e,s)=>{e.dislikes--,e.usersDisliked.splice(e.usersDisliked.indexOf(s),1)},n=(e,s)=>e.usersLiked.find((e=>e===s)),u=(e,s)=>e.usersDisliked.find((e=>e===s));s.getAllSauces=(e,s)=>{o.find().then((e=>s.status(200).json(e))).catch((e=>s.status(400).json({error:e})))},s.createSauce=(e,s)=>{const r=JSON.parse(e.body.sauce);r.userId=s.locals.userId,new o({...r,imageUrl:`${e.protocol}://${e.get("host")}/images/${e.file.filename}`,likes:0,dislikes:0,usersLiked:[],usersDisliked:[]}).save().then((()=>s.status(201).json({message:"Sauce enregistrée !"}))).catch((e=>s.status(400).json({error:e})))},s.getOneSauce=(e,s)=>{s.status(200).json(s.locals.sauce)},s.updateSauce=(e,s)=>{const r=s.locals.sauce;if(e.file){const i={...JSON.parse(e.body.sauce),imageUrl:`${e.protocol}://${e.get("host")}/images/${e.file.filename}`},a=r.imageUrl.split("/images/")[1];t.unlink(`images/${a}`,(()=>{o.updateOne({_id:r._id},i).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})))}))}else{const t={...e.body};o.updateOne({_id:r._id},t).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})))}},s.deleteSauce=(e,s)=>{const r=s.locals.sauce,i=r.imageUrl.split("/images/")[1];t.unlink(`images/${i}`,(()=>{o.deleteOne({_id:r._id}).then((()=>s.status(200).json({message:"Sauce supprimée !"}))).catch((e=>s.status(500).json({error:e})))}))},s.likeSauce=(e,s)=>{const r=s.locals.userId,t=s.locals.sauce;switch(e.body.like){case 1:if(n(t,r))return s.status(400).json({error:"Sauce déjà likée..."});u(t,r)&&a(t,r),((e,s)=>{e.likes++,e.usersLiked.push(s)})(t,r);break;case-1:if(u(t,r))return s.status(400).json({error:"Sauce déjà dislikée..."});n(t,r)&&i(t,r),((e,s)=>{e.dislikes++,e.usersDisliked.push(s)})(t,r);break;case 0:case 0:n(t,r)?i(t,r):u(t,r)&&a(t,r)}o.updateOne({_id:t._id},t).then((()=>s.status(200).json({message:"Sauce likée !"}))).catch((e=>s.status(500).json({error:e})))}},612:(e,s,r)=>{const t=r(96),o=r(344),i=r(862);s.signup=async(e,s)=>{try{const r=await t.hash(e.body.password,10),o=new i({email:e.body.email,password:r});await o.save(),s.status(201).json({message:"Utilisateur créé !"})}catch(e){"User validation failed"===e._message?s.status(400).json({error:"Email déjà utilisé..."}):s.status(500).json({error:e})}},s.login=async(e,s)=>{try{const r=await i.findOne({email:e.body.email});if(!r)return s.status(400).json({error:"Utilisateur non trouvé..."});if(!await t.compare(e.body.password,r.password))return s.status(401).json({error:"Mot de passe incorrect..."});s.status(200).json({userId:r._id,token:o.sign({userId:r._id},process.env.TOKEN_SECRET_KEY,{expiresIn:"24h"})})}catch(e){s.status(500).json({error:e})}}},752:(e,s,r)=>{const t=r(344);s.token=(e,s,r)=>{try{const o=e.headers.authorization?.split(" ")[1],i=t.verify(o,process.env.TOKEN_SECRET_KEY);s.locals.userId=i.userId,r()}catch(e){s.status(401).json({error:e})}},s.sauce=(e,s,r)=>{const t=s.locals.userId;if(s.locals.sauce.userId!==t)return s.status(403).json({error:"Sauce non possédée..."});r()}},250:(e,s,r)=>{const t=r(738),o={"image/jpg":"jpg","image/jpeg":"jpg","image/png":"png"},i=t.diskStorage({destination:(e,s,r)=>{r(null,"images")},filename:(e,s,r)=>{const t=o[s.mimetype];r(null,`${Date.now()}.${t}`)}});e.exports=t({storage:i}).single("image")},10:(e,s,r)=>{const t=r(185),o=t.Schema({userId:{type:String,required:!0,immutable:!0},name:{type:String,required:!0},manufacturer:{type:String,required:!0},description:{type:String,required:!0},mainPepper:{type:String,required:!0},imageUrl:{type:String,required:!0},heat:{type:Number,required:!0},likes:{type:Number,required:!0},dislikes:{type:Number,required:!0},usersLiked:{type:[String],required:!0},usersDisliked:{type:[String],required:!0}});e.exports=t.model("Sauce",o)},862:(e,s,r)=>{const t=r(185),o=r(288),i=t.Schema({email:{type:String,required:!0,unique:!0},password:{type:String,required:!0}});i.plugin(o),e.exports=t.model("User",i)},616:(e,s,r)=>{const t=r(860).Router(),o=r(752),i=r(250),a=r(10),n=r(36);t.use(o.token),t.route("/").get(n.getAllSauces).post(i,n.createSauce),t.route("/:id").get(n.getOneSauce).put(o.sauce,i,n.updateSauce).delete(o.sauce,n.deleteSauce),t.post("/:id/like",n.likeSauce),t.param("id",(async(e,s,r,t)=>{try{const e=await a.findOne({_id:t});if(!e)return s.status(400).json({error:"Sauce introuvable..."});s.locals.sauce=e,r()}catch(e){s.status(500).json({error:e})}})),e.exports=t},327:(e,s,r)=>{const t=r(860).Router(),o=r(612);t.post("/signup",o.signup),t.post("/login",o.login),e.exports=t},96:e=>{"use strict";e.exports=require("bcrypt")},142:e=>{"use strict";e.exports=require("dotenv")},860:e=>{"use strict";e.exports=require("express")},344:e=>{"use strict";e.exports=require("jsonwebtoken")},185:e=>{"use strict";e.exports=require("mongoose")},288:e=>{"use strict";e.exports=require("mongoose-unique-validator")},738:e=>{"use strict";e.exports=require("multer")},147:e=>{"use strict";e.exports=require("fs")},685:e=>{"use strict";e.exports=require("http")}},s={};function r(t){var o=s[t];if(void 0!==o)return o.exports;var i=s[t]={exports:{}};return e[t](i,i.exports,r),i.exports}(()=>{const e=r(685);r(142).config();const s=r(389),t=e.createServer(s);t.on("error",(e=>{if("listen"!==e.syscall)throw e;const s=`port: ${t.address().port}`;switch(e.code){case"EACCES":console.error(s+" requires elevated privileges."),process.exit(1);break;case"EADDRINUSE":console.error(s+" is already in use."),process.exit(1);break;default:throw e}})),t.on("listening",(()=>console.log(`Listening on port ${t.address().port}`))),t.listen(process.env.PORT)})()})();