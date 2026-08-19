import {Router} from "express"
import {registerUser, loginUser, getCurrentUser} from "../controllers/auth.controllers.js"
import { userRegisterValidator, userLoginValidator } from "../validators/index.js"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { validate } from "../middleware/validators.middleware.js"


const router = Router()



router.route("/register").post( userRegisterValidator(), validate,  registerUser)

router.route("/login").post(userLoginValidator(),validate, loginUser)

router.route('/getMe').get(verifyJWT, validate, getCurrentUser)

export default router