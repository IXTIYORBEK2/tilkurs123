
const { body, validationResult } = require("express-validator");

const validateNote = [
    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Ism kiritilishi shart")
        .bail()
        .isString()
        .withMessage("Ism matn bo'lishi kerak")
        .bail()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Ism 2 dan 100 belgigacha bo'lishi kerak"),

    body("description")
        .optional({ values: "null" })
        .isString()
        .withMessage("Tavsif matn bo'lishi kerak")
        .bail()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Tavsif 1000 belgidan oshmasligi kerak"),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Yuborilgan ma'lumot noto'g'ri",
                errors: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg
                }))
            });
        }

        next();
    }
];

module.exports = validateNote;
