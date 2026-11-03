const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function generateQuoteNumber(index) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `Q-${date}-${String(index).padStart(4, '0')}`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItems(arr, min, max) {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

function vnd(value) {
  return Math.round(value * 100) / 100;
}

// ----------------------------------------------------------------------------
// Seed data
// ----------------------------------------------------------------------------
const admins = [
  { fullName: 'Nguyễn Văn Admin', email: 'nguyen.vanadmin@salehub.com', password: 'Admin@123', role: 'ADMIN' },
  { fullName: 'Trần Thị Quản Lý', email: 'tran.quanly@salehub.com', password: 'Admin@123', role: 'ADMIN' },
  { fullName: 'Lê Minh Giám Đốc', email: 'le.giamdoc@salehub.com', password: 'Admin@123', role: 'ADMIN' },
];

const salesReps = [
  { fullName: 'Phạm Đức Sales', email: 'pham.duc@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Hoàng Minh Sales', email: 'hoang.minh@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Vũ Thị Sales', email: 'vu.thi@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Đặng Văn Sales', email: 'dang.van@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Bùi Thị Sales', email: 'bui.thi@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Ngô Minh Sales', email: 'ngo.minh@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Đỗ Văn Sales', email: 'do.van@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Lý Thị Sales', email: 'ly.thi@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Trương Minh Sales', email: 'truong.minh@salehub.com', password: 'Sales@123', role: 'SALES' },
  { fullName: 'Mai Văn Sales', email: 'mai.van@salehub.com', password: 'Sales@123', role: 'SALES' },
];

const customerUsers = [
  { fullName: 'Nguyễn Văn A', email: 'a.nguyen@techflow.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Trần Thị B', email: 'b.tran@greensoft.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Lê Văn C', email: 'c.le@fastnet.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Phạm Thị D', email: 'd.pham@cloudpeak.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Hoàng Văn E', email: 'e.hoang@secureit.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Vũ Thị F', email: 'f.vu@datacore.com', password: 'Customer@123', role: 'CUSTOMER' },
  { fullName: 'Đặng Văn G', email: 'g.dang@innovix.com', password: 'Customer@123', role: 'CUSTOMER' },
];

const products = [
  // Cloud
  {
    name: 'AWS Services',
    category: 'Cloud',
    price: 150000000,
    description: 'Comprehensive AWS cloud infrastructure and managed services for enterprises.',
    specifications: {
      provider: 'AWS',
      regions: ['ap-southeast-1', 'ap-northeast-1'],
      compute: 'EC2',
      storage: 'S3',
      sla: '99.99%',
    },
  },
  {
    name: 'Azure Solutions',
    category: 'Cloud',
    price: 120000000,
    description: 'Microsoft Azure enterprise cloud solutions and hybrid integration.',
    specifications: {
      provider: 'Microsoft Azure',
      regions: ['Southeast Asia', 'East Asia'],
      services: ['Virtual Machines', 'Blob Storage', 'Azure AD'],
      sla: '99.95%',
    },
  },
  {
    name: 'GCP Platform',
    category: 'Cloud',
    price: 130000000,
    description: 'Google Cloud Platform services including compute, data and Kubernetes.',
    specifications: {
      provider: 'Google Cloud',
      regions: ['asia-southeast1'],
      services: ['Compute Engine', 'BigQuery', 'GKE'],
      sla: '99.99%',
    },
  },
  {
    name: 'Cloud Migration',
    category: 'Cloud',
    price: 80000000,
    description: 'End-to-end cloud migration assessment and implementation service.',
    specifications: {
      provider: 'Multi-cloud',
      scope: 'Assessment + Migration',
      duration: '3 months',
      sla: '99.9%',
    },
  },
  // Security
  {
    name: 'Firewall Solution',
    category: 'Security',
    price: 95000000,
    description: 'Next-generation enterprise firewall with intrusion prevention.',
    specifications: {
      vendor: 'Palo Alto Networks',
      throughput: '10 Gbps',
      licenses: 1,
      support: '24/7',
    },
  },
  {
    name: 'Endpoint Security',
    category: 'Security',
    price: 45000000,
    description: 'Cloud-native endpoint detection and response platform.',
    specifications: {
      vendor: 'CrowdStrike',
      endpoints: 500,
      deployment: 'Cloud-native',
      support: '24/7',
    },
  },
  {
    name: 'SIEM Platform',
    category: 'Security',
    price: 75000000,
    description: 'Security information and event management platform.',
    specifications: {
      vendor: 'Splunk',
      eps: 5000,
      retention: '12 months',
      support: 'Business hours + 24/7 critical',
    },
  },
  {
    name: 'Penetration Testing',
    category: 'Security',
    price: 25000000,
    description: 'Comprehensive penetration testing and vulnerability assessment.',
    specifications: {
      scope: ['Web', 'Network', 'Mobile'],
      duration: '2 weeks',
      deliverable: 'Detailed report + remediation roadmap',
    },
  },
  // Network
  {
    name: 'SD-WAN Solution',
    category: 'Network',
    price: 110000000,
    description: 'Software-defined WAN for distributed enterprise branches.',
    specifications: {
      vendor: 'Cisco',
      sites: 20,
      bandwidth: '1 Gbps',
      management: 'Centralized cloud',
    },
  },
  {
    name: 'Network Monitoring',
    category: 'Network',
    price: 35000000,
    description: 'Enterprise network performance monitoring and alerting.',
    specifications: {
      vendor: 'SolarWinds',
      nodes: 1000,
      pollingInterval: '1 minute',
      deployment: 'On-premise + Cloud',
    },
  },
  {
    name: 'WiFi Infrastructure',
    category: 'Network',
    price: 60000000,
    description: 'Enterprise wireless LAN infrastructure and management.',
    specifications: {
      vendor: 'Aruba',
      accessPoints: 50,
      coverage: '10000 sqm',
      standards: ['Wi-Fi 6E'],
    },
  },
  {
    name: 'VPN Service',
    category: 'Network',
    price: 28000000,
    description: 'Secure remote access VPN service for workforce.',
    specifications: {
      vendor: 'Fortinet',
      concurrentUsers: 500,
      tunnels: 100,
      support: '24/7',
    },
  },
  // Software
  {
    name: 'ERP System',
    category: 'Software',
    price: 250000000,
    description: 'Enterprise resource planning system for finance and operations.',
    specifications: {
      vendor: 'SAP',
      users: 100,
      modules: ['Finance', 'Inventory', 'HR', 'Procurement'],
      deployment: 'Cloud',
    },
  },
  {
    name: 'CRM Platform',
    category: 'Software',
    price: 120000000,
    description: 'Customer relationship management and sales automation platform.',
    specifications: {
      vendor: 'Salesforce',
      users: 50,
      edition: 'Enterprise',
      features: ['Sales Cloud', 'Service Cloud'],
    },
  },
  {
    name: 'Project Management',
    category: 'Software',
    price: 50000000,
    description: 'Agile project management and team collaboration suite.',
    specifications: {
      vendor: 'Atlassian',
      users: 200,
      products: ['Jira', 'Confluence'],
      deployment: 'Cloud',
    },
  },
  {
    name: 'Business Intelligence',
    category: 'Software',
    price: 80000000,
    description: 'BI platform for dashboards, reporting and data visualization.',
    specifications: {
      vendor: 'Tableau',
      users: 30,
      connectors: '100+',
      deployment: 'Cloud',
    },
  },
  // Hardware
  {
    name: 'Server Rack',
    category: 'Hardware',
    price: 180000000,
    description: 'High-performance rack server for data center workloads.',
    specifications: {
      vendor: 'Dell',
      cpu: '2x Intel Xeon Silver',
      ram: '256 GB',
      storage: '8 TB SSD',
    },
  },
  {
    name: 'Network Switch',
    category: 'Hardware',
    price: 42000000,
    description: 'Managed Layer 3 switch with PoE and 10GbE uplinks.',
    specifications: {
      vendor: 'Cisco',
      ports: '48x 10GbE',
      poe: true,
      layer: 3,
    },
  },
  {
    name: 'Storage Array',
    category: 'Hardware',
    price: 320000000,
    description: 'Enterprise storage array with flash and hybrid tiering.',
    specifications: {
      vendor: 'HPE',
      rawCapacity: '100 TB',
      raid: 'RAID 6',
      protocol: ['FC', 'iSCSI'],
    },
  },
  {
    name: 'Workstation',
    category: 'Hardware',
    price: 15000000,
    description: 'Professional workstation for engineering and design workloads.',
    specifications: {
      vendor: 'HP',
      cpu: 'Intel Core i9',
      ram: '64 GB',
      gpu: 'NVIDIA RTX A4000',
    },
  },
];

const customers = [
  // NEW (5)
  { companyName: 'Công ty TNHH Công Nghệ Sao Việt', contactName: 'Nguyễn Văn An', email: 'an.nguyen@saoviettech.com.vn', phone: '0901234567', address: '123 Lê Lợi, Quận 1, TP.HCM', status: 'NEW' },
  { companyName: 'Ngân hàng TMCP Phát Triển', contactName: 'Trần Thị Bình', email: 'binh.tran@mdb.com.vn', phone: '0901234568', address: '45 Nguyễn Huệ, Quận 1, TP.HCM', status: 'NEW' },
  { companyName: 'Tập đoàn Bán Lẻ VinMart', contactName: 'Lê Văn Cường', email: 'cuong.le@vinmart.vn', phone: '0901234569', address: '72 Hùng Vương, Hải Phòng', status: 'NEW' },
  { companyName: 'Bệnh viện Đa khoa Hòa Bình', contactName: 'Phạm Thị Dung', email: 'dung.pham@bvhoabinh.vn', phone: '0901234570', address: '89 Nguyễn Văn Linh, Đà Nẵng', status: 'NEW' },
  { companyName: 'Trường Đại học Kinh tế Quốc dân', contactName: 'Hoàng Văn Em', email: 'em.hoang@neu.edu.vn', phone: '0901234571', address: '207 Giải Phóng, Hà Nội', status: 'NEW' },
  // CONTACTED (5)
  { companyName: 'Công ty Cổ phần Sản xuất May Sông Hồng', contactName: 'Vũ Thị Hương', email: 'huong.vu@mayhong.vn', phone: '0901234572', address: '12 Trần Phú, Hà Nội', status: 'CONTACTED' },
  { companyName: 'Tổng công ty Viễn thông MobiFone', contactName: 'Đặng Văn Ích', email: 'ich.dang@mobifone.vn', phone: '0901234573', address: '11 Phạm Hùng, Hà Nội', status: 'CONTACTED' },
  { companyName: 'Công ty TNHH Dược phẩm Traphaco', contactName: 'Bùi Thị Lan', email: 'lan.bui@traphaco.com.vn', phone: '0901234574', address: '75 Quang Trung, Hà Nội', status: 'CONTACTED' },
  { companyName: 'Siêu thị Điện máy Xanh', contactName: 'Ngô Văn Minh', email: 'minh.ngo@dienmayxanh.com', phone: '0901234575', address: '88 Cách Mạng Tháng 8, TP.HCM', status: 'CONTACTED' },
  { companyName: 'Tập đoàn FPT', contactName: 'Đỗ Thị Ngọc', email: 'ngoc.do@fpt.com.vn', phone: '0901234576', address: '10 Phạm Văn Bạch, Hà Nội', status: 'CONTACTED' },
  // QUALIFIED (5)
  { companyName: 'Công ty Cổ phần Thép Hòa Phát', contactName: 'Lý Văn Phúc', email: 'phuc.ly@hoaphat.com.vn', phone: '0901234577', address: '1 Đường Hòa Phát, Hưng Yên', status: 'QUALIFIED' },
  { companyName: 'Ngân hàng TMCP Á Châu ACB', contactName: 'Trương Thị Quỳnh', email: 'quynh.truong@acb.com.vn', phone: '0901234578', address: '442 Nguyễn Thị Minh Khai, TP.HCM', status: 'QUALIFIED' },
  { companyName: 'Tập đoàn Vingroup', contactName: 'Mai Văn Sơn', email: 'son.mai@vingroup.com', phone: '0901234579', address: '7 Đại lộ Thăng Long, Hà Nội', status: 'QUALIFIED' },
  { companyName: 'Công ty Cổ phần Đầu tư Vinpearl', contactName: 'Phan Thị Tuyết', email: 'tuyet.phan@vinpearl.com', phone: '0901234580', address: '60 Hạ Long, Quảng Ninh', status: 'QUALIFIED' },
  { companyName: 'Bộ Công an - Cục Cảnh sát QLHC', contactName: 'Võ Văn Uy', email: 'uy.vo@bocongan.gov.vn', phone: '0901234581', address: '47 Phạm Văn Đồng, Hà Nội', status: 'QUALIFIED' },
  // PROPOSAL (5)
  { companyName: 'Công ty TNHH Samsung Electronics Việt Nam', contactName: 'Nguyễn Thị Vân', email: 'van.nguyen@samsung.com', phone: '0901234582', address: 'KCN Yên Phong, Bắc Ninh', status: 'PROPOSAL' },
  { companyName: 'Tập đoàn Dầu khí Petrovietnam', contactName: 'Trần Văn Xuân', email: 'xuan.tran@pvn.vn', phone: '0901234583', address: '18 Láng Hạ, Hà Nội', status: 'PROPOSAL' },
  { companyName: 'Công ty Cổ phần Hàng không Vietjet', contactName: 'Lê Thị Yến', email: 'yen.le@vietjetair.com', phone: '0901234584', address: '302 Kim Mã, Hà Nội', status: 'PROPOSAL' },
  { companyName: 'Tổng Công ty Điện lực EVN', contactName: 'Phạm Văn Bảo', email: 'bao.pham@evn.com.vn', phone: '0901234585', address: '18 Cửa Bắc, Hà Nội', status: 'PROPOSAL' },
  { companyName: 'Công ty TNHH Unilever Việt Nam', contactName: 'Hoàng Thị Cẩm', email: 'cam.hoang@unilever.com', phone: '0901234586', address: '65 đường số 11, KCN VSIP, Bình Dương', status: 'PROPOSAL' },
  // CLOSED (5)
  { companyName: 'Ngân hàng TMCP Ngoại thương Vietcombank', contactName: 'Nguyễn Văn Đức', email: 'duc.nguyen@vietcombank.com.vn', phone: '0901234587', address: '198 Trần Quang Khải, Hà Nội', status: 'CLOSED' },
  { companyName: 'Tập đoàn Bảo Việt', contactName: 'Trần Thị Hạnh', email: 'hanh.tran@baoviet.com.vn', phone: '0901234588', address: '8 Phạm Hùng, Hà Nội', status: 'CLOSED' },
  { companyName: 'Công ty Cổ phần Tập đoàn Masan', contactName: 'Lê Văn Hùng', email: 'hung.le@masan.vn', phone: '0901234589', address: '39 Lê Duẩn, TP.HCM', status: 'CLOSED' },
  { companyName: 'Tổng công ty Khí Việt Nam PV Gas', contactName: 'Phạm Thị Linh', email: 'linh.pham@pvgas.com.vn', phone: '0901234590', address: '9 Tân Định, Quận 1, TP.HCM', status: 'CLOSED' },
  { companyName: 'Công ty TNHH BMW Việt Nam', contactName: 'Vũ Văn Mạnh', email: 'manh.vu@bmw.vn', phone: '0901234591', address: '68 Lê Văn Lương, Hà Nội', status: 'CLOSED' },
];

const dealFocuses = [
  'Cloud Transformation',
  'Security Hardening',
  'Network Upgrade',
  'Software License',
  'Hardware Procurement',
  'Data Center Modernization',
  'Endpoint Protection',
  'Managed Services',
];

const quoteStatusPool = [
  ...Array(10).fill('DRAFT'),
  ...Array(12).fill('SENT'),
  ...Array(10).fill('ACCEPTED'),
  ...Array(5).fill('REJECTED'),
  ...Array(3).fill('EXPIRED'),
];

const callNotes = [
  'Discussed project requirements and timeline.',
  'Follow-up on previous proposal.',
  'Initial discovery call - identified key pain points.',
  'Technical deep dive on security requirements.',
  'Price negotiation discussion.',
  'Scheduled next meeting with IT director.',
  'Reviewed current infrastructure challenges.',
  'Clarified budget constraints and approval process.',
];

const emailNotes = [
  'Sent product brochure and pricing.',
  'Follow-up email after meeting.',
  'Proposal document attached.',
  'Technical specification document shared.',
  'Contract draft sent for review.',
  'Thank you email after demo session.',
  'Reminder about quote expiration.',
  'Meeting invitation sent to stakeholders.',
];

const meetingNotes = [
  'On-site demo of the solution.',
  'Requirements gathering workshop.',
  'Stakeholder presentation.',
  'Contract signing meeting.',
  'Technical architecture review.',
  'Quarterly business review.',
  'Solution design workshop.',
  'Executive sponsor alignment meeting.',
];

// ----------------------------------------------------------------------------
// Main seed function
// ----------------------------------------------------------------------------
async function main() {
  // 1. Clean existing data (reverse dependency order)
  await prisma.activity.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.file.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  console.log('Existing data cleared.');

  // 2. Create users
  const allUserInputs = [...admins, ...salesReps, ...customerUsers];
  const createdUsers = [];
  for (const user of allUserInputs) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const created = await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        isActive: true,
      },
    });
    createdUsers.push(created);
  }
  const createdSalesReps = createdUsers.filter((u) => u.role === 'SALES');
  const createdCustomerUsers = createdUsers.filter((u) => u.role === 'CUSTOMER');
  console.log(`Created ${createdUsers.length} users (${admins.length} admins, ${salesReps.length} sales, ${customerUsers.length} customers).`);

  // 3. Create products
  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: vnd(product.price),
        specifications: product.specifications,
      },
    });
    createdProducts.push(created);
  }
  console.log(`Created ${createdProducts.length} products.`);

  // 4. Create customers
  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: {
        companyName: customer.companyName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
      },
    });
    createdCustomers.push(created);
  }
  console.log(`Created ${createdCustomers.length} customers.`);

  // 5. Create deals (2 per customer = 50)
  const stagePool = shuffle([
    ...Array(10).fill('LEAD'),
    ...Array(10).fill('QUALIFICATION'),
    ...Array(12).fill('PROPOSAL'),
    ...Array(8).fill('NEGOTIATION'),
    ...Array(6).fill('CLOSED_WON'),
    ...Array(4).fill('CLOSED_LOST'),
  ]);

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const sixMonthsAhead = new Date(now);
  sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

  const createdDeals = [];
  let stageIndex = 0;
  for (const customer of createdCustomers) {
    for (let i = 0; i < 2; i += 1) {
      const stage = stagePool[stageIndex++];
      const value = vnd(randomInt(10_000_000, 2_000_000_000));

      let probability;
      if (stage === 'LEAD') probability = randomInt(10, 25);
      else if (stage === 'QUALIFICATION') probability = randomInt(25, 45);
      else if (stage === 'PROPOSAL') probability = randomInt(45, 65);
      else if (stage === 'NEGOTIATION') probability = randomInt(65, 85);
      else if (stage === 'CLOSED_WON') probability = 100;
      else probability = 0;

      const expectedCloseDate = stage === 'CLOSED_WON' || stage === 'CLOSED_LOST'
        ? randomDate(threeMonthsAgo, now)
        : randomDate(now, sixMonthsAhead);

      const salesRep = randomItem(createdSalesReps);
      const focus = randomItem(dealFocuses);

      const deal = await prisma.deal.create({
        data: {
          title: `${customer.companyName} - ${focus}`,
          customerId: customer.id,
          salesRepId: salesRep.id,
          stage,
          value,
          probability,
          expectedCloseDate,
        },
      });
      createdDeals.push(deal);
    }
  }
  console.log(`Created ${createdDeals.length} deals.`);

  // 6. Create quotes (40)
  const shuffledQuoteStatuses = shuffle([...quoteStatusPool]);
  const createdQuotes = [];
  for (let i = 0; i < 40; i += 1) {
    const deal = randomItem(createdDeals);
    const quoteProducts = randomItems(createdProducts, 2, 5);
    const items = quoteProducts.map((product) => {
      const quantity = randomInt(1, 5);
      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        quantity,
        unitPrice: Number(product.price),
        total: vnd(Number(product.price) * quantity),
      };
    });
    const totalAmount = vnd(items.reduce((sum, item) => sum + item.total, 0));
    const status = shuffledQuoteStatuses[i];

    const createdAt = randomDate(threeMonthsAgo, now);
    const validUntil = status === 'EXPIRED'
      ? new Date(createdAt.getTime() - 5 * 24 * 60 * 60 * 1000)
      : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(i + 1),
        dealId: deal.id,
        items,
        totalAmount,
        status,
        validUntil,
        createdAt,
      },
    });
    createdQuotes.push(quote);
  }
  console.log(`Created ${createdQuotes.length} quotes.`);

  // 7. Create activities (100)
  const activityTypePool = shuffle([
    ...Array(40).fill('CALL'),
    ...Array(35).fill('EMAIL'),
    ...Array(25).fill('MEETING'),
  ]);

  const createdActivities = [];
  for (let i = 0; i < 100; i += 1) {
    const deal = randomItem(createdDeals);
    const type = activityTypePool[i];
    let notes;
    if (type === 'CALL') notes = randomItem(callNotes);
    else if (type === 'EMAIL') notes = randomItem(emailNotes);
    else notes = randomItem(meetingNotes);

    const createdAt = randomDate(threeMonthsAgo, now);
    const activity = await prisma.activity.create({
      data: {
        dealId: deal.id,
        type,
        notes,
        createdAt,
      },
    });
    createdActivities.push(activity);
  }
  console.log(`Created ${createdActivities.length} activities.`);

  // 8. Summary
  console.log('\nSeeding completed successfully.');
  console.table({
    users: createdUsers.length,
    salesReps: createdSalesReps.length,
    customerUsers: createdCustomerUsers.length,
    products: createdProducts.length,
    customers: createdCustomers.length,
    deals: createdDeals.length,
    quotes: createdQuotes.length,
    activities: createdActivities.length,
  });
}

async function seed() {
  await main();
}

async function autoSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database is empty, running seed...');
      await seed();
      console.log('Seed completed successfully');
    } else {
      console.log('Database already has data, skipping seed');
    }
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.env.NODE_ENV === 'production') {
  autoSeed();
} else if (require.main === module) {
  seed()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
