import {Router} from "express"
import {registerUser, loginUser} from "../controllers/auth.controllers.js"
import { userRegisterValidator, userLoginValidator } from "../validators/index.js"


const router = Router()



router.post("/register", userRegisterValidator(),  registerUser)

router.post("/login", userLoginValidator(), loginUser)

export default router