export const homepage = (req,res) =>{
    res.render('homepage');
}

export const planpage = (req,res) =>{
    res.render('planpage');
}

export const subscriptionpage = (req,res) =>{
    res.render('subscription');
}

export const loginpage = (req,res) =>{
    res.render('login');
}

export const registerpage = (req,res) =>{
    res.render('register');
}

export const adminpage = (req,res) =>{
  const programs = [
  { _id: 1, title: "Morning Yoga", description: "Relaxing yoga", duration: 30, price: 9.99, videoUrl: "https://youtube.com/..." },
  { _id: 2, title: "HIIT Workout", description: "High intensity", duration: 45, price: 14.99, videoUrl: "https://vimeo.com/..." },
];

const subscribers = [
  { name: "Aarav Sharma", email: "aarav@example.com", plan: "Monthly Plan", joinDate: "2025-05-01" },
];

const payments = [
  { user: "Sneha Gurung", plan: "HIIT Workout", amount: 14.99, date: "2025-05-05", txnId: "TXN123456" },
];



    res.render('admin',{programs,subscribers,payments});
}

export const userpage = (req,res) =>{
    const user = { name: "Sneha Gurung" };

const programs = [
  { title: "Morning Stretch", description: "Start your day fresh", duration: 30, price: 10, videoUrl: "https://youtube.com/..." },
  { title: "Core Strength", description: "Focus on abs and core", duration: 45, price: 15, videoUrl: "https://youtube.com/..." },
];

const subscriptions = [
  { _id: 1, plan: "Morning Stretch", amount: 10, date: "2025-05-01", status: "Active" },
  { _id: 2, plan: "Core Strength", amount: 15, date: "2025-04-01", status: "Cancelled" },
];

    res.render('user',{user,programs,subscriptions});
}

export const programpage = (req,res) =>{
    res.render('programpage');
}

export const cardpage = (req,res) =>{
    const user = { name: "Ramesh Koirala" };
    const program = { title: "Power HIIT Burn" };
    const purchaseDate = "2025-05-10";
    const expiryDate = "2025-06-10";
    const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Ramesh+PowerHIIT";

    res.render('card',{user,program,purchaseDate,expiryDate,qrCodeUrl});
}