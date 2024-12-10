const express = require("express");
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

const { getAllProduct , createProduct ,updateProduct , deleteProduct , productDetail ,
    createProductReview, deleteReview, getProductReviews, 
    getAdminProduct,getCategoryProduct , getCategoryWiseProduct} = require("../controlers/productControlers");
const { isAuthenticated ,authorizeRoles} = require("../middleware/Auth");



const router = express.Router();

 router.route("/products").get(getAllProduct)
// router.route("/products").get(getCategoryProduct)

router.route("/admin/products").get(isAuthenticated , authorizeRoles("admin") , getAdminProduct)

router.route("/admin/product/new").post(isAuthenticated,authorizeRoles("admin"),createProduct)

router.route("/admin/product/:id").put(isAuthenticated,authorizeRoles("admin"),updateProduct)
router.route("/admin/product/:id").delete(isAuthenticated,authorizeRoles("admin"),deleteProduct)
router.route("/product/:id").get(productDetail)
router.route("/review").put(isAuthenticated,createProductReview)
router.route("/reviews").get(getProductReviews).delete(isAuthenticated,deleteReview)
router.route("/get-categoryProduct").get(getCategoryProduct)
router.route("/category-product").post(getCategoryWiseProduct)

module.exports = router;