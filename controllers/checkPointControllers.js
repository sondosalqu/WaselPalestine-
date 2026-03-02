

const db=require("../config/db.js");

const { Checkpoint } = require("../models");



const getCheckPoints = async(req, res) => {
const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
const offset = (page - 1) * limit;

const allowedSortFields = [
  "checkpoint_id",
  "checkpoint_name",
];

let sortBy = String(req.query.sortBy || "")

if (!allowedSortFields.includes(sortBy)) {
  sortBy = "checkpoint_id"; 
}

const sortOrder =
  (req.query.sortOrder || "asc").toLowerCase() === "desc"
    ? "DESC"
    : "ASC";

const status = req.query.status ? String(req.query.status).trim() : null;


 const q = req.query.q ? String(req.query.q).trim() : (req.query.name ? String(req.query.name).trim() : null);

try{
const where = [];
    const params = [];

    
    if (status) {
      where.push("current_status = ?");
      params.push(status);
    }

   
    if (q) {
      where.push("checkpoint_name LIKE ?");
      params.push(`%${q}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM checkpoints ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = Number(countRows?.[0]?.total || 0);

    const sql = `
      SELECT *
      FROM checkpoints
      ${whereSql}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [checkPoints] = await db.query(sql, [...params, limit, offset]);


if(!checkPoints.length){
    return res.status(404).send({ 
        success: false,
        message: "No checkpoints found",
          error :" "
     });

    }
    return res.status(200).send({
      success: true,
      message: "Checkpoints fetched successfully",
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: checkPoints, 
    });

}catch(error){
console.error("Error fetching checkpoints:", error);
    res.status(500).send({ 
        success: false,
        message: "Failed to fetch checkpoints",
        error :"Internal server error"
     });

}
}

const getCheckpointById = async(req, res) => {

try{
  const checkpointId = Number(req.params.id);


     if (!Number.isInteger(checkpointId) || checkpointId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
           error :"bad request"
      });
    }
console.log("Checkpoint =", Checkpoint);
console.log("typeof Checkpoint =", typeof Checkpoint);
  const checkpoint = await Checkpoint.findByPk(checkpointId);

if(!checkpoint){
    return res.status(404).send({ 
        success: false,
        message: "Checkpoint not found",
          error :"Checkpoint not found"
     });

    }
    return res.status(200).send({
      success: true,
      message: "Checkpoint fetched successfully",
      data: checkpoint, 
    });





}catch(error){
  console.error("Error fetching checkpoint by ID:", error);
  res.status(500).send({ 
      success: false,
      message: "Failed to fetch checkpoint by ID",
      error :"Internal server error"
   });
}

}

const updateCheckpoint = async(req, res) => {



try{
  const checkpointId = Number(req.params.id);


     if (!Number.isInteger(checkpointId) || checkpointId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkpoint ID",
        error :"bad request"
      });
    }

    const checkpoint = await Checkpoint.findByPk(checkpointId);
const { checkpoint_name,current_status, lat, lng } = req.body;
if(!checkpoint){
    return res.status(404).send({ 
        success: false,
        message: "Checkpoint not found",
          error :" "
     });
    }
  if (
      checkpoint_name === undefined &&
      lat === undefined &&
      lng === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
          error :" "
      });
    }

 

await Checkpoint.update(
  {
    checkpoint_name: checkpoint_name ?? checkpoint.checkpoint_name,
    lat: lat ?? checkpoint.lat,
    lng: lng ?? checkpoint.lng
  },
  { where: { checkpoint_id: checkpointId } }
);

const updated = await Checkpoint.findByPk(checkpointId);
if(!updated){
    return res.status(404).send({ 
        success: false,
        message: "Checkpoint not found",
          error :" "
     });

    }
    return res.status(200).send({
      success: true,
      message: "Checkpoint updated successfully",
      data: updated , 
    });





}catch(error){
  console.error("Error updating checkpoint:", error);
  res.status(500).send({ 
      success: false,
      message: "Failed to update checkpoint",
      error :"Internal server error"
   });
}








}

const updateCheckpointStatus = async(req, res) => {


}




module.exports = {
  getCheckPoints,
  getCheckpointById,
  updateCheckpoint,
  updateCheckpointStatus
};