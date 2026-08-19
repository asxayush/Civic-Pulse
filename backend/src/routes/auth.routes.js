import {Router} from "express"
import {registerUser, loginUser, getCurrentUser} from "../controllers/auth.controllers.js"
import { userRegisterValidator, userLoginValidator } from "../validators/index.js"
import { verifyJWT } from "../middleware/auth.middleware.js"


const router = Router()



router.route("/register").post( userRegisterValidator(),  registerUser)

router.route("/login").post(userLoginValidator(), loginUser)

router.route('/getMe').get(verifyJWT, getCurrentUser)

export default router