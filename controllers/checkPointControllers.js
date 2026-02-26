

const db=require("../config/db.js");






const getCheckPoints = async(req, res) => {


try{

const [checkPoints] = await db.query("SELECT * FROM checkpoints");
if(!checkPoints.length){
    return res.status(404).send({ 
        success: false,
        message: "No checkpoints found"
     });

    }
    return res.status(200).send({ 
        success: true,
        message: "Checkpoints fetched successfully",
        data: checkPoints
     });

}catch(error){
console.error("Error fetching checkpoints:", error);
    res.status(500).send({ 
        success: false,
        message: "Failed to fetch checkpoints",
        error
     });

}







}
module.exports = { getCheckPoints };