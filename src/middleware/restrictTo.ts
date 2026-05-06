// import { Request, Response, NextFunction } from "express";

// export const restrictTo = (...roles: string[]) => {
//   return (req: any, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "Access denied",
//       });
//     }
//     next();
//   };
// };


// import { UserRole } from "../model/user.model";

// import { Request, Response, NextFunction } from "express";

// export const restrictTo = (...roles: UserRole[]) => {
    
//   return (req: any, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "Access denied",
//       });
//     }
//     next();
//   };
// };


import { Response, NextFunction } from "express";
import { UserRole } from "../model/user.model";

export const restrictTo = (...roles: UserRole[]) => {

  return (
    req: any,
    res: Response,
    next: NextFunction
  ) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};