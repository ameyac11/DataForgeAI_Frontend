export const sampleDatasets = [
  {
    id: '1',
    name: 'E-commerce Transactions',
    category: 'Business',
    format: 'CSV',
    rows: 10000,
    description: 'Complete e-commerce transaction data with customer details, products, and payment info.',
  },
  {
    id: '2',
    name: 'Healthcare Patient Records',
    category: 'Healthcare',
    format: 'JSON',
    rows: 5000,
    description: 'Synthetic patient data including demographics, diagnoses, and treatment history.',
  },
  {
    id: '3',
    name: 'Financial Stock Data',
    category: 'Finance',
    format: 'CSV',
    rows: 50000,
    description: 'Historical stock prices with OHLC data and trading volumes.',
  },
  {
    id: '4',
    name: 'Social Media Users',
    category: 'Social',
    format: 'JSON',
    rows: 25000,
    description: 'User profiles with engagement metrics and activity patterns.',
  },
  {
    id: '5',
    name: 'IoT Sensor Data',
    category: 'Technology',
    format: 'Parquet',
    rows: 100000,
    description: 'Time-series sensor readings from various IoT devices.',
  },
  {
    id: '6',
    name: 'HR Employee Records',
    category: 'Business',
    format: 'SQL',
    rows: 2000,
    description: 'Employee data with salaries, departments, and performance metrics.',
  },
  {
    id: '7',
    name: 'Real Estate Listings',
    category: 'Business',
    format: 'JSON',
    rows: 15000,
    description: 'Property listings with prices, locations, and features for real estate analysis.',
  },
  {
    id: '8',
    name: 'Customer Support Tickets',
    category: 'Business',
    format: 'CSV',
    rows: 8000,
    description: 'Support ticket data with categories, priorities, and resolution times.',
  },
  {
    id: '9',
    name: 'Retail Inventory',
    category: 'Business',
    format: 'SQL',
    rows: 12000,
    description: 'Product inventory levels, SKUs, and warehouse locations.',
  },
  {
    id: '10',
    name: 'Weather Observations',
    category: 'Science',
    format: 'CSV',
    rows: 75000,
    description: 'Historical weather data with temperature, humidity, and precipitation.',
  },
  {
    id: '11',
    name: 'Movie Reviews',
    category: 'Entertainment',
    format: 'JSON',
    rows: 30000,
    description: 'Movie reviews with ratings, sentiment scores, and user demographics.',
  },
  {
    id: '12',
    name: 'Airline Flight Data',
    category: 'Transportation',
    format: 'Parquet',
    rows: 200000,
    description: 'Flight schedules, delays, and cancellation records.',
  },
  {
    id: '13',
    name: 'Bank Transactions',
    category: 'Finance',
    format: 'CSV',
    rows: 45000,
    description: 'Banking transaction records with categories and merchant data.',
  },
  {
    id: '14',
    name: 'Student Grades',
    category: 'Education',
    format: 'JSON',
    rows: 6000,
    description: 'Academic records with grades, courses, and student performance.',
  },
  {
    id: '15',
    name: 'Restaurant Orders',
    category: 'Business',
    format: 'SQL',
    rows: 20000,
    description: 'Food order data with items, prices, and delivery information.',
  },
  {
    id: '16',
    name: 'Vehicle Fleet Data',
    category: 'Transportation',
    format: 'CSV',
    rows: 3500,
    description: 'Fleet management data with vehicle details and maintenance logs.',
  },
  {
    id: '17',
    name: 'Insurance Claims',
    category: 'Finance',
    format: 'JSON',
    rows: 18000,
    description: 'Insurance claim records with types, amounts, and processing status.',
  },
  {
    id: '18',
    name: 'Marketing Campaigns',
    category: 'Marketing',
    format: 'CSV',
    rows: 5500,
    description: 'Campaign performance data with impressions, clicks, and conversions.',
  },
  {
    id: '19',
    name: 'Clinical Trial Data',
    category: 'Healthcare',
    format: 'Parquet',
    rows: 8500,
    description: 'Clinical trial results with patient outcomes and treatment groups.',
  },
  {
    id: '20',
    name: 'Gaming Player Stats',
    category: 'Entertainment',
    format: 'JSON',
    rows: 40000,
    description: 'Player statistics, achievements, and in-game activity metrics.',
  },
];

export const recentChats = [
  {
    id: '1',
    name: 'Sales dataset with 1,000 rows',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    starred: false,
  },
  {
    id: '2',
    name: 'Japanese healthcare data',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    starred: true,
  },
  {
    id: '3',
    name: 'Employee salaries dataset',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    starred: false,
  },
  {
    id: '4',
    name: 'E-commerce transactions',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    starred: false,
  },
];

export const dataTypes = {
  'Personal Information': [
    'Full Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Age', 'Gender', 'Date of Birth', 'SSN', 'Passport Number'
  ],
  'Location': [
    'Address', 'City', 'State', 'Country', 'Zip Code', 'Latitude', 'Longitude', 'Region', 'Street Name', 'Building Number'
  ],
  'Financial': [
    'Credit Card', 'Bank Account', 'Currency', 'Price', 'Salary', 'Transaction Amount', 'Balance', 'IBAN', 'BIC', 'Tax ID'
  ],
  'Dates & Time': [
    'Date', 'Time', 'DateTime', 'Timestamp', 'Year', 'Month', 'Day', 'Hour', 'Timezone', 'Duration'
  ],
  'Identifiers': [
    'UUID', 'ID', 'SKU', 'Barcode', 'ISBN', 'Serial Number', 'Order ID', 'Customer ID', 'Product ID', 'Session ID'
  ],
  'Custom': [
    'Custom Text', 'Custom Number', 'Custom Boolean', 'Custom Enum', 'Custom Regex', 'Custom Formula'
  ],
};

export const tryExamples = [
  'Create a sales dataset with 1,000 rows including product names, prices, and quantities',
  'Generate employee data with realistic salaries and department information',
  'Create a healthcare dataset for Japan with patient records',
  'Generate SaaS subscription data with monthly recurring revenue',
];

export const faqItems = [
  {
    question: 'What is synthetic data?',
    answer: 'Synthetic data is artificially generated data that mimics real-world data patterns without containing actual personal or sensitive information. It\'s perfect for testing, development, and training machine learning models.',
  },
  {
    question: 'Is this data real?',
    answer: 'No, all data generated by DataForgeAI is synthetic. It\'s statistically similar to real data but doesn\'t represent actual individuals or entities, making it safe for development and testing purposes.',
  },
  {
    question: 'Can I download datasets?',
    answer: 'Yes! You can download datasets in multiple formats including CSV, JSON, SQL, and Parquet. Both chat-generated and custom-generated datasets are available for download.',
  },
  {
    question: 'Is coding required?',
    answer: 'Not at all! DataForgeAI is designed for everyone. Use our chat interface (DataForge AI) to describe what you need in plain English, or use the visual Custom Generator to build datasets without any coding.',
  },
];

export const templateColumns = {
  'User Profile': [
    { name: 'user_id', dataType: 'UUID' },
    { name: 'first_name', dataType: 'First Name' },
    { name: 'last_name', dataType: 'Last Name' },
    { name: 'email', dataType: 'Email' },
    { name: 'phone', dataType: 'Phone' },
    { name: 'created_at', dataType: 'DateTime' },
  ],
  'Product Catalog': [
    { name: 'product_id', dataType: 'UUID' },
    { name: 'product_name', dataType: 'String' },
    { name: 'category', dataType: 'String' },
    { name: 'price', dataType: 'Price' },
    { name: 'stock_quantity', dataType: 'Number' },
    { name: 'sku', dataType: 'UUID' },
  ],
  'Financial Transaction': [
    { name: 'transaction_id', dataType: 'UUID' },
    { name: 'account_number', dataType: 'Credit Card' },
    { name: 'amount', dataType: 'Price' },
    { name: 'currency', dataType: 'String' },
    { name: 'transaction_date', dataType: 'DateTime' },
    { name: 'status', dataType: 'String' },
  ],
};
