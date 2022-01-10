(()=>{var e={389:(e,s,t)=>{const r=t(667),i=t(185);i.connect(process.env.MONGO_DB_KEY).catch((e=>{console.error("Failed to connect to MongoDB..."),r.showError(e)}));const a=i.connection;a.once("open",(()=>console.log("Connected to MongoDB!"))),a.on("error",r.showError);const o=t(860),n=o();n.use(((e,s,t)=>{s.setHeader("Access-Control-Allow-Origin","*"),s.setHeader("Access-Control-Allow-Headers","Authorization, Content-Type"),s.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, DELETE"),"OPTIONS"!==e.method?t():s.sendStatus(200)})),n.use("/images",o.static("images")),n.use(o.json());const u=t(327),c=t(616);n.use("/api/auth",u),n.use("/api/sauces",c),e.exports=n},36:(e,s,t)=>{const r=t(147),i=t(10),a=(e,s)=>{e.likes--,e.usersLiked.splice(e.usersLiked.indexOf(s),1)},o=(e,s)=>{e.dislikes--,e.usersDisliked.splice(e.usersDisliked.indexOf(s),1)},n=(e,s)=>e.usersLiked.find((e=>e===s)),u=(e,s)=>e.usersDisliked.find((e=>e===s)),c=(e,s)=>((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Nom requis."):"string"!=typeof e?(r=!1,t="Le nom doit être une chaîne de caractères."):e.length<=50||(r=!1,t="Le nom ne doit pas excéder 50 caractères."),r||s.status(400).json({message:t}),r})(e.name,s)&&((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Fabricant requis."):"string"!=typeof e?(r=!1,t="Le fabricant doit être une chaîne de caractères."):e.length<=50||(r=!1,t="Le fabricant ne doit pas excéder 50 caractères."),r||s.status(400).json({message:t}),r})(e.manufacturer,s)&&((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Description requise."):"string"!=typeof e?(r=!1,t="La description doit être une chaîne de caractères."):e.length<=500||(r=!1,t="La description ne doit pas excéder 500 caractères."),r||s.status(400).json({message:t}),r})(e.description,s)&&((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Principal ingrédient épicé requis."):"string"!=typeof e?(r=!1,t="Le principal ingrédient épicé doit être une chaîne de caractères."):e.length<=50||(r=!1,t="Le principal ingrédient épicé ne doit pas excéder 50 caractères."),r||s.status(400).json({message:t}),r})(e.mainPepper,s)&&((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Ardeur requise."):"number"!=typeof e?(r=!1,t="L'ardeur doit être un nombre."):e>=1&&e<=10||(r=!1,t="L'ardeur doit être comprise entre 1 et 10."),r||s.status(400).json({message:t}),r})(e.heat,s);s.getAllSauces=(e,s)=>{i.find().then((e=>s.status(200).json(e))).catch((e=>s.status(400).json({error:e})))},s.createSauce=(e,s)=>{const t=JSON.parse(e.body.sauce?e.body.sauce:"{}");if(t.userId=s.locals.userId,!e.file)return s.status(400).json({message:"Fichier image requis."});if(!c(t,s))return void r.unlink(`images/${e.file.filename}`,(e=>{e&&console.error(e)}));const a=`${e.protocol}://${e.get("host")}/images/${e.file.filename}`;new i({...t,imageUrl:a,likes:0,dislikes:0,usersLiked:[],usersDisliked:[]}).save().then((()=>s.status(201).json({message:"Sauce enregistrée !"}))).catch((e=>s.status(400).json({error:e})))},s.getOneSauce=(e,s)=>{s.status(200).json(s.locals.sauce)},s.updateSauce=(e,s)=>{const t=s.locals.sauce;if("multipart/form-data"===e.headers["content-type"].split(";")[0]&&!e.file)return s.status(400).json({message:"Fichier image requis."});const a=e.file?{...JSON.parse(e.body.sauce?e.body.sauce:"{}"),imageUrl:`${e.protocol}://${e.get("host")}/images/${e.file.filename}`}:{...e.body};if(c(a,s))if(e.file){const e=t.imageUrl.split("/images/")[1];r.unlink(`images/${e}`,(()=>{i.updateOne({_id:t._id},a).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})))}))}else i.updateOne({_id:t._id},a).then((()=>s.status(200).json({message:"Sauce modifiée !"}))).catch((e=>s.status(500).json({error:e})));else e.file&&r.unlink(`images/${e.file.filename}`,(e=>{e&&console.error(e)}))},s.deleteSauce=(e,s)=>{const t=s.locals.sauce,a=t.imageUrl.split("/images/")[1];r.unlink(`images/${a}`,(()=>{i.deleteOne({_id:t._id}).then((()=>s.status(200).json({message:"Sauce supprimée !"}))).catch((e=>s.status(500).json({error:e})))}))},s.likeSauce=(e,s)=>{const t=s.locals.userId,r=s.locals.sauce,c=e.body.like;let d;if(((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="L'état du like est requis."):"number"!=typeof e?(r=!1,t="L'état du like doit être un nombre."):e>=-1&&e<=1||(r=!1,t="L'état du like doit être compris entre -1 et 1."),r||s.status(400).json({message:t}),r})(c,s)){switch(c){case 1:if(n(r,t))return s.status(400).json({message:"Sauce déjà likée..."});u(r,t)&&o(r,t),((e,s)=>{e.likes++,e.usersLiked.push(s)})(r,t),d="Sauce likée !";break;case-1:if(u(r,t))return s.status(400).json({message:"Sauce déjà dislikée..."});n(r,t)&&a(r,t),((e,s)=>{e.dislikes++,e.usersDisliked.push(s)})(r,t),d="Sauce dislikée !";break;case 0:case 0:if(n(r,t))a(r,t),d="Sauce unlikée !";else{if(!u(r,t))return s.status(400).json({message:"Sauce pas likée ni dislikée..."});o(r,t),d="Sauce undislikée !"}}i.updateOne({_id:r._id},r).then((()=>s.status(200).json({message:d}))).catch((e=>s.status(500).json({error:e})))}}},612:(e,s,t)=>{const r=t(96),i=t(344),a=t(862),o=(e,s,t)=>((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Email requis."):"string"!=typeof e?(r=!1,t="L'email doit être une chaîne de caractères."):/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.exec(e)?e.length<=50||(r=!1,t="L'email ne doit pas excéder 50 caractères."):(r=!1,t="L'email est invalide."),r||s.status(400).json({message:t}),r})(e,t)&&((e,s)=>{let t,r=!0;return""===e||void 0===e?(r=!1,t="Mot de passe requis."):"string"!=typeof e?(r=!1,t="Le mot de passe doit être une chaîne de caractères."):e.length<=50||(r=!1,t="Le mot de passe ne doit pas excéder 50 caractères."),r||s.status(400).json({message:t}),r})(s,t);s.signup=async(e,s)=>{try{const t=e.body.email,i=e.body.password;if(!o(t,i,s))return;const n=await r.hash(i,10),u=new a({email:t,password:n});await u.save(),s.status(201).json({message:"Utilisateur créé !"})}catch(e){if("User validation failed"===e._message)return s.status(400).json({message:"Email déjà utilisé..."});s.status(500).json({error:e})}},s.login=async(e,s)=>{try{const t=e.body.email,n=e.body.password;if(!o(t,n,s))return;const u=await a.findOne({email:t});if(!u)return s.status(400).json({message:"Utilisateur non trouvé..."});if(!await r.compare(n,u.password))return s.status(401).json({message:"Mot de passe incorrect..."});s.status(200).json({userId:u._id,token:i.sign({userId:u._id},process.env.TOKEN_SECRET_KEY,{expiresIn:"24h"})})}catch(e){s.status(500).json({error:e})}}},667:(e,s)=>{s.showError=e=>{console.error(),console.error(e),console.error()}},752:(e,s,t)=>{const r=t(344);s.token=(e,s,t)=>{try{const i=e.headers.authorization?.split(" ")[1],a=r.verify(i,process.env.TOKEN_SECRET_KEY);s.locals.userId=a.userId,t()}catch(e){s.status(401).json({error:e})}},s.sauce=(e,s,t)=>{const r=s.locals.userId;if(s.locals.sauce.userId!==r)return s.status(403).json({message:"Sauce non possédée..."});t()}},204:(e,s,t)=>{const r=t(738),i={"image/jpg":"jpg","image/jpeg":"jpg","image/png":"png"},a=r.diskStorage({destination:(e,s,t)=>t(null,"images"),filename:(e,s,t)=>{t(null,`sauce_${Date.now()}_${Math.random().toString().slice(2)}.${i[s.mimetype]}`)}});e.exports=r({storage:a}).single("image")},10:(e,s,t)=>{const r=t(185),i=r.Schema({userId:{type:String,required:!0,immutable:!0},name:{type:String,required:!0},manufacturer:{type:String,required:!0},description:{type:String,required:!0},mainPepper:{type:String,required:!0},imageUrl:{type:String,required:!0},heat:{type:Number,required:!0},likes:{type:Number,required:!0},dislikes:{type:Number,required:!0},usersLiked:{type:[String],required:!0},usersDisliked:{type:[String],required:!0}});e.exports=r.model("Sauce",i)},862:(e,s,t)=>{const r=t(185),i=t(288),a=r.Schema({email:{type:String,required:!0,unique:!0},password:{type:String,required:!0}});a.plugin(i),e.exports=r.model("User",a)},616:(e,s,t)=>{const r=t(860).Router(),i=t(752),a=t(204),o=t(10),n=t(36);r.use(i.token),r.route("/").get(n.getAllSauces).post(a,n.createSauce),r.route("/:id").get(n.getOneSauce).put(i.sauce,a,n.updateSauce).delete(i.sauce,n.deleteSauce),r.post("/:id/like",n.likeSauce),r.param("id",(async(e,s,t,r)=>{try{const e=await o.findOne({_id:r});if(!e)return s.status(400).json({message:"Sauce introuvable..."});s.locals.sauce=e,t()}catch(e){s.status(500).json({error:e})}})),e.exports=r},327:(e,s,t)=>{const r=t(860).Router(),i=t(612);r.post("/signup",i.signup),r.post("/login",i.login),e.exports=r},96:e=>{"use strict";e.exports=require("bcrypt")},142:e=>{"use strict";e.exports=require("dotenv")},860:e=>{"use strict";e.exports=require("express")},344:e=>{"use strict";e.exports=require("jsonwebtoken")},185:e=>{"use strict";e.exports=require("mongoose")},288:e=>{"use strict";e.exports=require("mongoose-unique-validator")},738:e=>{"use strict";e.exports=require("multer")},147:e=>{"use strict";e.exports=require("fs")},685:e=>{"use strict";e.exports=require("http")}},s={};function t(r){var i=s[r];if(void 0!==i)return i.exports;var a=s[r]={exports:{}};return e[r](a,a.exports,t),a.exports}(()=>{t(142).config();const e=t(667),s=t(685),r=t(389),i=s.createServer(r);i.on("error",(s=>{const t=`Port ${s.port}`;switch(s.code){case"EACCES":console.error(t+" requires elevated privileges.");break;case"EADDRINUSE":console.error(t+" is already in use.");break;default:e.showError(s)}process.exit(1)})),i.on("listening",(()=>console.log(`Listening on port ${i.address().port}!`)));try{i.listen(process.env.PORT||3e3)}catch(s){"ERR_SOCKET_BAD_PORT"===s.code?console.error("Port should be >= 0 and < 65536."):e.showError(s),process.exit(1)}})()})();