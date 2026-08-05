import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/account", "/orders", "/checkout"];
const MAINTENANCE_MODE = true;

export default function middleware(req: NextRequest) {
// if (MAINTENANCE_MODE) {
//     return new NextResponse(
//       `
//      <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=1.0" />
// <title>Site Offline</title>

// <style>
// *{
//     margin:0;
//     padding:0;
//     box-sizing:border-box;
// }

// body{
//     font-family:Inter,Arial,sans-serif;
//     background:#0b0b0b;
//     color:#fff;
//     display:flex;
//     justify-content:center;
//     align-items:center;
//     min-height:100vh;
//     text-align:center;
// }

// .container{
//     max-width:600px;
//     padding:40px;
// }

// .logo{
//     width:180px;
//     margin-bottom:50px;
// }

// .status{
//     display:inline-block;
//     padding:8px 18px;
//     border:1px solid #444;
//     border-radius:999px;
//     color:#aaa;
//     font-size:13px;
//     letter-spacing:2px;
//     text-transform:uppercase;
//     margin-bottom:25px;
// }

// h1{
//     font-size:58px;
//     font-weight:800;
//     margin-bottom:18px;
//     letter-spacing:-2px;
// }

// p{
//     color:#9ca3af;
//     font-size:18px;
//     line-height:1.8;
//     margin-bottom:40px;
// }

// .divider{
//     width:70px;
//     height:3px;
//     background:#facc15;
//     margin:0 auto 35px;
//     border-radius:999px;
// }

// small{
//     color:#666;
//     font-size:14px;
// }
// </style>
// </head>

// <body>

// <div class="container">

   
//     <div class="status">
//         Website Status 
//     </div>

//     <h1>Site Offline✌</h1>

//     <p>
//         This website is currently unavailable.
//         Please check back later.
//     </p>

//     <div class="divider"></div>


// </div>

// </body>
// </html>
//       `,
//       {
//         status: 503,
//         headers: {
//           "Content-Type": "text/html",
//         },
//       }
//     );
//   }



  const { pathname } = req.nextUrl;

  const sessionToken =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuth = !!sessionToken;

  // Protected route + not logged in → redirect to home with modal trigger
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuth) {
      let from = pathname;
      if (req.nextUrl.search) from += req.nextUrl.search;

      const url = new URL("/", req.url);
      url.searchParams.set("auth", "login");
      url.searchParams.set("redirect", from);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.webp$).*)",
  ],
};
