var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

var InstnSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    organization: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
});

InstnSchema.pre('save', function (next) {
    var instn = this;
    console.log("User saved successfully", instn);
    if (!instn.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(instn.password, salt, function (err, hash) {
            if (err) return next(err);
            instn.password = hash;
            next();
        });
    });
});

InstnSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("tbl_instn", InstnSchema);