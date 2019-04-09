var express = require('express');
var router = express.Router();
require('./../until/util');
var User = require("./../models/user");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//登录
router.post("/login",function(req,res,next){
  var param = {
    userName:req.body.userName,
    userPwd:req.body.userPwd
  }
  User.findOne(param,function(err,doc){
      if(err){
        res.json({
          status:"1",
          msg:"错误:"+err.message
        })
      }else{
        if(doc){
          res.cookie("userId",doc.userId,{
            path:'/',
            maxAge:1000*60*60
          }),
          res.cookie("userName",doc.userName,{
            path:'/',
            maxAge:1000*60*60
          })
          // req.session.user = doc;
          res.json({
            status:'0',
            msg:'',
            result:{
              userName:doc.userName
            }
          })
        }else{
          res.json({
            status:'1',
            msg:"您的账号或者密码有误",
            result:''
          })
        }
      }
  })
});

//登出接口
router.post("/logout",function(req,res,next){
  res.cookie("userId","",{
    path:"/",
    maxAge:-1
  })
  res.json({
    status:"0",
    msg:"",
    res:""
  })
})

//校验用户
router.get("/checkLogin",(req,res,next)=>{
  if(req.cookies.userId){
    res.json({
      status:"0",
      msg:"",
      result:req.cookies.userName || ""
    })
  }else{
    res.json({
      status:"1",
      msg:"未登录",
      result:''
    })
  }
})

//返回购物车商品数量数量
router.get("/getCartCount",(req,res,next)=>{
  var userId = req.cookies.userId;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      var cartList = doc.cartList;
      let cartCount = 0;
      cartList.forEach((item)=>{
        cartCount += parseInt(item.productNum);
      })
      res.json({
          stauts:'0',
          msg:'',
          result:cartCount
      })
    }
  })
})

//查询当前用户购物车数据
router.get("/cartList",function(req,res,next){
    var userId = req.cookies.userId;
    User.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:"1",
          msg:err.message,
          result:''
        });
      }else{
        if(doc){
          res.json({
            status:"0",
            msg:"",
            result:doc.cartList
          })
        }
      }
    })
})

//购物车删除
router.post("/cartDel",(req,res,next)=>{
  var userId = req.cookies.userId, productId = req.body.productId;
  User.update({userId:userId},{$pull:{'cartList':{'productId':productId} }
  },(err,doc)=>{
      if(err){
        res.json({
          status:"1",
          msg:err.message,
          result:''
        })
      }else{
        res.json({
          status:"0",
          msg:'',
          result:'success'
        })
      }
  })
})

//购物车数据的修改
router.post("/cartEdit",(req,res,next)=>{
  var userId = req.cookies.userId,productId = req.body.productId,productNum = req.body.productNum,checked = req.body.checked;
  User.update({userId:userId,"cartList.productId":productId},{
    //update son document's function
    "cartList.$.productNum":productNum,"cartList.$.checked":checked},(err,doc)=>{
      if(err){
        res.json({
          status:"1",
          msg:err.message,
          result:""
        });
      }else{
        res.json({
          status:"0",
          msg:'',
          result:"success"
        })
      }
    })
}),

//全选功能
router.post("/checkAll",(req,res,next)=>{
  var userId = req.cookies.userId,checkAll = req.body.checkAll ? 1 : 0 ;
  User.findOne({userId:userId},(err,user)=>{
     if(err){
       res.json({
         status:"1",
         msg:err.message,
         result:""
       });
     }else{
       if(user){
         user.cartList.forEach((item)=>{
           item.checked = checkAll;
         })
         user.save((err1,doc)=>{
          if(err1){
            res.json({
                status:"1",
                msg:err1.message,
                result:''
            })
        }else{
            res.json({
                status:'0',
                msg:'haha',
                result:"success"
            })
        }
         })
       }
     }
  })
})

//查询用户地址接口
router.get('/addressList',function(req,res,next){
  var userId = req.cookies.userId;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:"0",
        msg:"",
        result:doc.addressList
      })
    }
  })
})

//设置默认地址
router.post("/setDefault",(req,res,next)=>{
  var userId = req.cookies.userId,addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:'1003',
      msg:'addressId is null',
      result:''
    })
  }else{
    User.findOne({userId:userId},(err,doc)=>{
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        var addressList = doc.addressList;
        addressList.forEach((address)=>{
          if(address.addressId == addressId){
            address.isDefault = true;
          }else{
            address.isDefault = false;
          }
        });
        doc.save((err1,doc1)=>{
            if(err1){
              res.json({
                status:'1',
                msg:err1.message,
                result:''
              })
            }else{
              res.json({
                status:'0',
                msg:'',
                result:'success'
              })
            }
        })
      }
    })
  }
})

//删除地址
router.post('/addressDel',(req,res,next)=>{
    userId = req.cookies.userId, addressId = req.body.addressId;
    User.update({userId:userId},{$pull:{'addressList':{'addressId':addressId}}
  },(err,doc)=>{
     if(err){
       res.json({
         status:'1',
         msg:err.message,
         result:''
       })
     }else{
       res.json({
         status:'0',
         msg:'',
         result:"success"
       })
     }
    })
})

//订单提交
router.post('/payMent',(req,res,next)=>{
  userId = req.cookies.userId,orderTotal = req.body.orderTotal,addressId = req.body.addressId;
  User.findOne({userId:userId},(err,doc)=>{
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      var address = '' , goodsList = [];
      //获取用户当前地址信息
      doc.addressList.forEach((item)=>{
        if(addressId == item.addressId){
           address = item;
        }
      })
      //获取用户购物车的商品信息
      doc.cartList.forEach((item)=>{
        if(item.checked == 1){
            goodsList.push(item);
        }
      })
      
      var platform = '622';
      var r1 = Math.floor(Math.random()*10);
      var r2 = Math.floor(Math.random()*10);
      
      var sysDate = new Date().Format('yyyyMMddhhmmss');
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId = platform+r1+sysDate+r2;

      //订单信息
      var order ={
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      };
      
      doc.orderList.push(order);
      
      doc.save((err1,doc1)=>{
        if(err1){
          res.json({
            status:'1',
            msg:err1.message,
            result:''
          })
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
    }
  })
})

//根据订单id订单详情
router.get("/orderDetail",(req,res,next)=>{
   userId = req.cookies.userId,orderId = req.param("orderId");
   User.findOne({userId:userId},(err,userInfo)=>{
     if(err){
       res.json({
         status:'1',
         msg:err.message,
         result:''
       })
     }else{
       let orderList = userInfo.orderList;
       if(orderList.length > 0){
          var orderTotal = 0;
          orderList.forEach((item)=>{
            if(item.orderId == orderId){
              orderTotal = item.orderTotal;
            }
          });
          if(orderTotal>0){
            res.json({
              status:0,
              msg:'',
              result:{
                orderId:orderId,
                orderTotal:orderTotal
              }
            })
          }else{
            res.json({
              status:"12002",
              msg:'无此订单',
              result:''
            })
          }
       }else{
        res.json({
          status:'12001',
          msg:'当前订单未被创建',
          result:''
        })
       }   
     }
   })
})
module.exports = router;
