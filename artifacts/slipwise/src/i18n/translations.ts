export type Language = "th" | "en";

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    noData: string;
    seeAll: string;
    optional: string;
    back: string;
    export: string;
    pdf: string;
    csv: string;
    excel: string;
    free: string;
    premium: string;
    perMonth: string;
  };
  nav: {
    home: string;
    expenses: string;
    reports: string;
    goals: string;
    settings: string;
    budgets: string;
    premium: string;
  };
  dashboard: {
    title: string;
    spentThisMonth: string;
    budget: string;
    left: string;
    today: string;
    thisWeek: string;
    thisMonth: string;
    thisYear: string;
    spendingByCategory: string;
    recentTransactions: string;
    noTransactions: string;
    addFirstExpense: string;
  };
  expenses: {
    title: string;
    searchPlaceholder: string;
    noExpenses: string;
    addFirst: string;
    deleteSuccess: string;
    deleteFail: string;
    filter: string;
    sortBy: string;
    amount: string;
    merchant: string;
    category: string;
    date: string;
    note: string;
    paymentMethod: string;
    receipt: string;
    addReceipt: string;
    tapToUpload: string;
    remove: string;
    extractDetails: string;
    scanning: string;
    addExpense: string;
    editExpense: string;
    saveChanges: string;
    saveExpense: string;
    merchantRequired: string;
    amountRequired: string;
    categoryRequired: string;
    dateRequired: string;
    expenseAdded: string;
    expenseUpdated: string;
    saveFailed: string;
    merchantDetected: string;
    amountDetected: string;
    scanFailed: string;
    pickDate: string;
    addDetails: string;
    selectCategory: string;
  };
  categories: {
    food: string;
    drink: string;
    shopping: string;
    transport: string;
    home: string;
    utilities: string;
    entertainment: string;
    health: string;
    education: string;
    work: string;
    salary: string;
    investment: string;
    gift: string;
    other: string;
  };
  reports: {
    title: string;
    overview: string;
    trends: string;
    spendingByCategory: string;
    spendingOverTime: string;
    topMerchants: string;
    noDataThisMonth: string;
    noDataAvailable: string;
    exportReport: string;
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
  budgets: {
    title: string;
    monthly: string;
    addBudget: string;
    editBudget: string;
    noBudgets: string;
    setFirst: string;
    spent: string;
    of: string;
    remaining: string;
    over: string;
    budgetLimit: string;
    selectCategory: string;
    warningAt50: string;
    warningAt80: string;
    warningAt100: string;
    saved: string;
    deleted: string;
    saveFailed: string;
  };
  goals: {
    title: string;
    addGoal: string;
    editGoal: string;
    noGoals: string;
    setFirst: string;
    target: string;
    saved: string;
    deadline: string;
    progress: string;
    completed: string;
    goalName: string;
    targetAmount: string;
    currentAmount: string;
    goalSaved: string;
    goalDeleted: string;
    saveFailed: string;
    contribute: string;
    daysLeft: string;
    overdue: string;
  };
  settings: {
    title: string;
    preferences: string;
    darkMode: string;
    currency: string;
    language: string;
    dateFormat: string;
    calendarEra: string;
    gregorian: string;
    buddhistEra: string;
    signOut: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    account: string;
    security: string;
    pinLock: string;
    biometric: string;
    notifications: string;
    version: string;
    aboutApp: string;
    managePremium: string;
  };
  premium: {
    title: string;
    subtitle: string;
    freePlan: string;
    premiumPlan: string;
    currentPlan: string;
    upgrade: string;
    features: {
      unlimitedExpenses: string;
      ocr30: string;
      ocrUnlimited: string;
      dashboard: string;
      reports: string;
      budget: string;
      cloudSync: string;
      aiInsights: string;
      unlimitedExport: string;
      unlimitedBackup: string;
      smartCategories: string;
      advancedAnalytics: string;
      familySharing: string;
      multiDevice: string;
    };
  };
  ocr: {
    bankName: string;
    sender: string;
    receiver: string;
    amount: string;
    date: string;
    time: string;
    reference: string;
    editBeforeSave: string;
    scannedFrom: string;
  };
}

const th: Translations = {
  common: {
    save: "บันทึก",
    cancel: "ยกเลิก",
    delete: "ลบ",
    edit: "แก้ไข",
    add: "เพิ่ม",
    close: "ปิด",
    confirm: "ยืนยัน",
    loading: "กำลังโหลด...",
    error: "เกิดข้อผิดพลาด",
    success: "สำเร็จ",
    noData: "ไม่มีข้อมูล",
    seeAll: "ดูทั้งหมด",
    optional: "(ไม่บังคับ)",
    back: "กลับ",
    export: "ส่งออก",
    pdf: "PDF",
    csv: "CSV",
    excel: "Excel",
    free: "ฟรี",
    premium: "พรีเมียม",
    perMonth: "/เดือน",
  },
  nav: {
    home: "หน้าหลัก",
    expenses: "รายจ่าย",
    reports: "รายงาน",
    goals: "เป้าหมาย",
    settings: "ตั้งค่า",
    budgets: "งบประมาณ",
    premium: "พรีเมียม",
  },
  dashboard: {
    title: "ภาพรวม",
    spentThisMonth: "ใช้จ่ายเดือนนี้",
    budget: "งบประมาณ",
    left: "คงเหลือ",
    today: "วันนี้",
    thisWeek: "สัปดาห์นี้",
    thisMonth: "เดือนนี้",
    thisYear: "ปีนี้",
    spendingByCategory: "การใช้จ่ายตามหมวด",
    recentTransactions: "รายการล่าสุด",
    noTransactions: "ยังไม่มีรายการ",
    addFirstExpense: "แตะปุ่ม + เพื่อเพิ่มรายการแรก",
  },
  expenses: {
    title: "รายจ่าย",
    searchPlaceholder: "ค้นหารายจ่าย...",
    noExpenses: "ยังไม่มีรายจ่าย",
    addFirst: "แตะปุ่ม + เพื่อเพิ่มรายจ่ายแรก",
    deleteSuccess: "ลบรายจ่ายแล้ว",
    deleteFail: "ลบรายจ่ายไม่สำเร็จ",
    filter: "กรอง",
    sortBy: "เรียงตาม",
    amount: "จำนวนเงิน",
    merchant: "ร้านค้า / ผู้รับเงิน",
    category: "หมวดหมู่",
    date: "วันที่",
    note: "หมายเหตุ",
    paymentMethod: "ช่องทางการชำระ",
    receipt: "ใบเสร็จ / สลิป",
    addReceipt: "เพิ่มใบเสร็จ",
    tapToUpload: "แตะเพื่ออัปโหลดหรือถ่ายภาพ",
    remove: "ลบ",
    extractDetails: "ดึงข้อมูลจากสลิป",
    scanning: "กำลังสแกน",
    addExpense: "เพิ่มรายจ่าย",
    editExpense: "แก้ไขรายจ่าย",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    saveExpense: "บันทึกรายจ่าย",
    merchantRequired: "กรุณาใส่ชื่อร้านค้า",
    amountRequired: "กรุณาใส่จำนวนเงิน",
    categoryRequired: "กรุณาเลือกหมวดหมู่",
    dateRequired: "กรุณาเลือกวันที่",
    expenseAdded: "เพิ่มรายจ่ายแล้ว",
    expenseUpdated: "อัปเดตรายจ่ายแล้ว",
    saveFailed: "บันทึกไม่สำเร็จ กรุณาลองใหม่",
    merchantDetected: "พบชื่อร้านค้า",
    amountDetected: "พบจำนวนเงิน",
    scanFailed: "สแกนไม่สำเร็จ กรุณาลองใหม่",
    pickDate: "เลือกวันที่",
    addDetails: "เพิ่มรายละเอียด...",
    selectCategory: "เลือกหมวดหมู่",
  },
  categories: {
    food: "🍜 อาหาร",
    drink: "☕ เครื่องดื่ม",
    shopping: "🛒 ช้อปปิ้ง",
    transport: "🚗 เดินทาง",
    home: "🏠 บ้าน",
    utilities: "💡 ค่าสาธารณูปโภค",
    entertainment: "🎮 บันเทิง",
    health: "🏥 สุขภาพ",
    education: "🎓 การศึกษา",
    work: "💼 งาน",
    salary: "💰 เงินเดือน",
    investment: "📈 การลงทุน",
    gift: "🎁 ของขวัญ",
    other: "📦 อื่นๆ",
  },
  reports: {
    title: "รายงาน",
    overview: "ภาพรวม",
    trends: "แนวโน้ม",
    spendingByCategory: "การใช้จ่ายตามหมวด",
    spendingOverTime: "การใช้จ่ายตามเวลา",
    topMerchants: "ร้านค้าที่ใช้จ่ายสูงสุด",
    noDataThisMonth: "ไม่มีข้อมูลเดือนนี้",
    noDataAvailable: "ไม่มีข้อมูล",
    exportReport: "ส่งออกรายงาน",
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    monthly: "รายเดือน",
    yearly: "รายปี",
  },
  budgets: {
    title: "งบประมาณ",
    monthly: "งบประมาณรายเดือน",
    addBudget: "เพิ่มงบประมาณ",
    editBudget: "แก้ไขงบประมาณ",
    noBudgets: "ยังไม่มีงบประมาณ",
    setFirst: "ตั้งงบประมาณเพื่อติดตามการใช้จ่าย",
    spent: "ใช้ไปแล้ว",
    of: "จาก",
    remaining: "คงเหลือ",
    over: "เกินงบ",
    budgetLimit: "วงเงินงบประมาณ",
    selectCategory: "เลือกหมวดหมู่",
    warningAt50: "แจ้งเตือนเมื่อใช้ครบ 50%",
    warningAt80: "แจ้งเตือนเมื่อใช้ครบ 80%",
    warningAt100: "แจ้งเตือนเมื่อใช้ครบ 100%",
    saved: "บันทึกงบประมาณแล้ว",
    deleted: "ลบงบประมาณแล้ว",
    saveFailed: "บันทึกไม่สำเร็จ",
  },
  goals: {
    title: "เป้าหมาย",
    addGoal: "เพิ่มเป้าหมาย",
    editGoal: "แก้ไขเป้าหมาย",
    noGoals: "ยังไม่มีเป้าหมาย",
    setFirst: "ตั้งเป้าหมายการออมเงิน",
    target: "เป้าหมาย",
    saved: "ออมแล้ว",
    deadline: "กำหนดส่ง",
    progress: "ความคืบหน้า",
    completed: "สำเร็จแล้ว!",
    goalName: "ชื่อเป้าหมาย",
    targetAmount: "จำนวนเป้าหมาย",
    currentAmount: "ออมได้แล้ว",
    goalSaved: "บันทึกเป้าหมายแล้ว",
    goalDeleted: "ลบเป้าหมายแล้ว",
    saveFailed: "บันทึกไม่สำเร็จ",
    contribute: "เพิ่มเงินออม",
    daysLeft: "วันที่เหลือ",
    overdue: "เลยกำหนดแล้ว",
  },
  settings: {
    title: "ตั้งค่า",
    preferences: "การตั้งค่า",
    darkMode: "โหมดมืด",
    currency: "สกุลเงิน",
    language: "ภาษา",
    dateFormat: "รูปแบบวันที่",
    calendarEra: "ปฏิทิน",
    gregorian: "คริสต์ศักราช (ค.ศ.)",
    buddhistEra: "พุทธศักราช (พ.ศ.)",
    signOut: "ออกจากระบบ",
    theme: "ธีม",
    themeLight: "สว่าง",
    themeDark: "มืด",
    themeSystem: "ตามระบบ",
    account: "บัญชีผู้ใช้",
    security: "ความปลอดภัย",
    pinLock: "ล็อกด้วย PIN",
    biometric: "ลายนิ้วมือ / Face ID",
    notifications: "การแจ้งเตือน",
    version: "เวอร์ชัน",
    aboutApp: "เกี่ยวกับแอป",
    managePremium: "จัดการสมาชิก",
  },
  premium: {
    title: "SlipWise Premium",
    subtitle: "ปลดล็อกฟีเจอร์เต็มรูปแบบ",
    freePlan: "แผนฟรี",
    premiumPlan: "แผนพรีเมียม",
    currentPlan: "แผนปัจจุบัน",
    upgrade: "อัปเกรดเป็น Premium",
    features: {
      unlimitedExpenses: "บันทึกรายจ่ายไม่จำกัด",
      ocr30: "สแกนสลิป 30 ครั้ง/เดือน",
      ocrUnlimited: "สแกนสลิปไม่จำกัด",
      dashboard: "แดชบอร์ดภาพรวม",
      reports: "รายงานการใช้จ่าย",
      budget: "จัดการงบประมาณ",
      cloudSync: "ซิงค์ข้อมูลบนคลาวด์",
      aiInsights: "AI วิเคราะห์การใช้จ่าย",
      unlimitedExport: "ส่งออกรายงานไม่จำกัด",
      unlimitedBackup: "สำรองข้อมูลไม่จำกัด",
      smartCategories: "หมวดหมู่อัจฉริยะ",
      advancedAnalytics: "วิเคราะห์เชิงลึก",
      familySharing: "แชร์กับครอบครัว",
      multiDevice: "ใช้ได้หลายอุปกรณ์",
    },
  },
  ocr: {
    bankName: "ธนาคาร",
    sender: "ผู้โอน",
    receiver: "ผู้รับ",
    amount: "จำนวนเงิน",
    date: "วันที่",
    time: "เวลา",
    reference: "เลขอ้างอิง",
    editBeforeSave: "ตรวจสอบข้อมูลก่อนบันทึก",
    scannedFrom: "สแกนจาก",
  },
};

const en: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noData: "No data",
    seeAll: "See all",
    optional: "(Optional)",
    back: "Back",
    export: "Export",
    pdf: "PDF",
    csv: "CSV",
    excel: "Excel",
    free: "Free",
    premium: "Premium",
    perMonth: "/month",
  },
  nav: {
    home: "Home",
    expenses: "Expenses",
    reports: "Reports",
    goals: "Goals",
    settings: "Settings",
    budgets: "Budgets",
    premium: "Premium",
  },
  dashboard: {
    title: "Overview",
    spentThisMonth: "Spent this month",
    budget: "Budget",
    left: "left",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    thisYear: "This Year",
    spendingByCategory: "Spending by Category",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet",
    addFirstExpense: "Tap + to add your first expense",
  },
  expenses: {
    title: "Expenses",
    searchPlaceholder: "Search expenses...",
    noExpenses: "No expenses yet",
    addFirst: "Tap + to add your first expense",
    deleteSuccess: "Expense deleted",
    deleteFail: "Failed to delete expense",
    filter: "Filter",
    sortBy: "Sort by",
    amount: "Amount",
    merchant: "Merchant",
    category: "Category",
    date: "Date",
    note: "Note",
    paymentMethod: "Payment Method",
    receipt: "Receipt / Slip",
    addReceipt: "Add receipt",
    tapToUpload: "Tap to upload or take a photo",
    remove: "Remove",
    extractDetails: "Extract Details",
    scanning: "Scanning",
    addExpense: "Add Expense",
    editExpense: "Edit Expense",
    saveChanges: "Save Changes",
    saveExpense: "Save Expense",
    merchantRequired: "Merchant is required",
    amountRequired: "Amount must be greater than 0",
    categoryRequired: "Category is required",
    dateRequired: "Date is required",
    expenseAdded: "Expense added",
    expenseUpdated: "Expense updated",
    saveFailed: "Failed to save. Please try again.",
    merchantDetected: "Merchant detected",
    amountDetected: "Amount detected",
    scanFailed: "Scan failed. Could not read the image.",
    pickDate: "Pick a date",
    addDetails: "Add details...",
    selectCategory: "Select category",
  },
  categories: {
    food: "🍜 Food",
    drink: "☕ Drink",
    shopping: "🛒 Shopping",
    transport: "🚗 Transport",
    home: "🏠 Home",
    utilities: "💡 Utilities",
    entertainment: "🎮 Entertainment",
    health: "🏥 Health",
    education: "🎓 Education",
    work: "💼 Work",
    salary: "💰 Salary",
    investment: "📈 Investment",
    gift: "🎁 Gift",
    other: "📦 Other",
  },
  reports: {
    title: "Reports",
    overview: "Overview",
    trends: "Trends",
    spendingByCategory: "Spending by Category",
    spendingOverTime: "Spending Over Time",
    topMerchants: "Top Merchants",
    noDataThisMonth: "No data for this month",
    noDataAvailable: "No data available",
    exportReport: "Export Report",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  },
  budgets: {
    title: "Budgets",
    monthly: "Monthly Budget",
    addBudget: "Add Budget",
    editBudget: "Edit Budget",
    noBudgets: "No budgets yet",
    setFirst: "Set a budget to track spending",
    spent: "Spent",
    of: "of",
    remaining: "remaining",
    over: "over budget",
    budgetLimit: "Budget Limit",
    selectCategory: "Select category",
    warningAt50: "Notify at 50%",
    warningAt80: "Notify at 80%",
    warningAt100: "Notify at 100%",
    saved: "Budget saved",
    deleted: "Budget deleted",
    saveFailed: "Failed to save",
  },
  goals: {
    title: "Goals",
    addGoal: "Add Goal",
    editGoal: "Edit Goal",
    noGoals: "No goals yet",
    setFirst: "Set a savings goal",
    target: "Target",
    saved: "Saved",
    deadline: "Deadline",
    progress: "Progress",
    completed: "Completed!",
    goalName: "Goal Name",
    targetAmount: "Target Amount",
    currentAmount: "Amount Saved",
    goalSaved: "Goal saved",
    goalDeleted: "Goal deleted",
    saveFailed: "Failed to save",
    contribute: "Add Savings",
    daysLeft: "days left",
    overdue: "Overdue",
  },
  settings: {
    title: "Settings",
    preferences: "Preferences",
    darkMode: "Dark Mode",
    currency: "Currency",
    language: "Language",
    dateFormat: "Date Format",
    calendarEra: "Calendar Era",
    gregorian: "Gregorian (AD/CE)",
    buddhistEra: "Buddhist Era (BE)",
    signOut: "Sign Out",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    account: "Account",
    security: "Security",
    pinLock: "PIN Lock",
    biometric: "Fingerprint / Face ID",
    notifications: "Notifications",
    version: "Version",
    aboutApp: "About SlipWise",
    managePremium: "Manage Subscription",
  },
  premium: {
    title: "SlipWise Premium",
    subtitle: "Unlock the full experience",
    freePlan: "Free Plan",
    premiumPlan: "Premium Plan",
    currentPlan: "Current Plan",
    upgrade: "Upgrade to Premium",
    features: {
      unlimitedExpenses: "Unlimited manual expenses",
      ocr30: "30 OCR scans/month",
      ocrUnlimited: "Unlimited OCR scans",
      dashboard: "Dashboard & Overview",
      reports: "Spending Reports",
      budget: "Budget Management",
      cloudSync: "Cloud Sync",
      aiInsights: "AI Spending Insights",
      unlimitedExport: "Unlimited Report Export",
      unlimitedBackup: "Unlimited Cloud Backup",
      smartCategories: "Smart Categories",
      advancedAnalytics: "Advanced Analytics",
      familySharing: "Family Sharing",
      multiDevice: "Multi-device Sync",
    },
  },
  ocr: {
    bankName: "Bank",
    sender: "Sender",
    receiver: "Receiver",
    amount: "Amount",
    date: "Date",
    time: "Time",
    reference: "Reference No.",
    editBeforeSave: "Review before saving",
    scannedFrom: "Scanned from",
  },
};

export const translations: Record<Language, Translations> = { th, en };
