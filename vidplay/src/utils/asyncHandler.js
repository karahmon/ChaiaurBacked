// const asyncHandler=(fn)=>async(req,res,next)=>{
//     try {
//         await fn(req,res,next);
        
//     } catch (error) {
//         res.send(error.code||500).json({success:false,
//             message:error.message||'Internal Server Error'});
//     }
// }

const asyncHandler = (requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> next(err))
}
}

export default asyncHandler;