// Destination-Aware & Style-Aware Intelligent Itinerary Engine

export const CURATED_ITINERARIES = {
  delhi: {
    title: 'Delhi Imperial Heritage & Culinary Odyssey',
    destination: 'Delhi, NCT of Delhi, India',
    weather: '18°C – 28°C, Pleasant Sun & Clear Skies',
    distance: '0 km (National Capital Hub)',
    stay: {
      name: 'Haveli Dharampura Heritage Hotel',
      type: '19th-Century Mughal Haveli',
      price: '₹5,500 / night',
      location: 'Chandni Chowk, Old Delhi',
    },
    transport: {
      method: 'Delhi Metro Express + Private AC Chauffeur Cab',
      route: 'Airport/Station → Central Delhi → Old Delhi Walled City → South Delhi Heritage Belt',
    },
    days: [
      {
        day: 1,
        title: 'Old Delhi Walled City, Spice Markets & Street Food Crawl',
        activities: [
          { time: '09:00 AM', title: 'Jama Masjid & Minaret Climb', desc: 'Marvel at India’s largest 17th-century mosque with panoramic views over Old Delhi rooftops.' },
          { time: '11:30 AM', title: 'Rickshaw Safari through Chandni Chowk & Khari Baoli', desc: 'Immerse in Asia’s largest wholesale spice market; inhale aromas of cardamom, saffron, and cloves.' },
          { time: '01:30 PM', title: 'Legendary Street Food Trail at Paranthe Wali Gali', desc: 'Savor crispy stuffed parathas, jalebis at Old Famous Jalebi Wala, and dahi bhalle at Natraj.' },
          { time: '04:30 PM', title: 'Red Fort (Lal Qila) Mughal Citadel Walk', desc: 'Walk through the grand Lahori Gate and inspect the Diwan-i-Khas marble pavilions.' },
          { time: '07:30 PM', title: 'Mughlai Dinner at Karim’s or Al Jawahar', desc: 'Authentic slow-cooked mutton nihari, seekh kebabs, and khameeri roti.' },
        ],
      },
      {
        day: 2,
        title: 'Lutyens Imperial Capital & Sufi Heritage',
        activities: [
          { time: '09:00 AM', title: 'Humayun’s Tomb (Precursor to the Taj Mahal)', desc: 'Explore the UNESCO Persian-style charbagh garden mausoleum built in red sandstone and white marble.' },
          { time: '12:00 PM', title: 'Sunder Nursery Ecological Park Stroll', desc: 'Walk amidst restored 16th-century Mughal monuments, peacocks, and artisan craft stalls.' },
          { time: '02:00 PM', title: 'Lunch at Cafe Lota (National Crafts Museum)', desc: 'Regional artisan culinary wonders including palak patta chaat and apple jalebis.' },
          { time: '04:30 PM', title: 'India Gate & Kartavya Path Golden Hour', desc: 'Stroll the ceremonial boulevard; pay homage at the National War Memorial as twilight descends.' },
          { time: '07:30 PM', title: 'Sufi Qawwali Night at Nizamuddin Dargah', desc: 'Experience the mystical spiritual qawwalis honoring Hazrat Nizamuddin Auliya.' },
        ],
      },
      {
        day: 3,
        title: 'South Delhi Bohemian Villages & Ancient Minarets',
        activities: [
          { time: '09:30 AM', title: 'Qutub Minar Complex & Iron Pillar', desc: 'Marvel at the 73-meter fluted minaret and the 1,600-year-old rust-resistant Gupta iron pillar.' },
          { time: '12:30 PM', title: 'Hauz Khas Social & Reservoir Walk', desc: 'Explore 13th-century Madrasa ruins overlooking deer park and relax with craft mocktails.' },
          { time: '03:30 PM', title: 'Lodhi Art District Open-Air Street Murals', desc: 'Guided walking photo-tour across 50+ giant contemporary graffiti walls painted by global artists.' },
          { time: '06:00 PM', title: 'Lotus Temple Sunset Serenity', desc: 'Meditate inside the marble flower-shaped Baháʼí temple during dusk illumination.' },
          { time: '08:30 PM', title: 'Khan Market Fine Dining & Cocktails', desc: 'Dine at Town Hall or Perch Wine & Coffee Bar amidst Delhi’s trendiest crowd.' },
        ],
      },
      {
        day: 4,
        title: 'Akshardham Spiritual Complex & Crafts Emporiums',
        activities: [
          { time: '10:00 AM', title: 'Swaminarayan Akshardham Complex', desc: 'Inspect intricate stone carvings, the Sanskruti boat ride depicting 10,000 years of Indian civilization.' },
          { time: '02:30 PM', title: 'Dilli Haat Food & Crafts Bazaar (INA)', desc: 'Shop traditional handlooms from all 28 states and feast on Momos, Naga pork, and Kashmiri Kahwa.' },
          { time: '06:00 PM', title: 'Sahaj Anand Musical Water Show', desc: 'Stunning 24-minute sound and light laser fountain performance at Akshardham.' },
        ],
      },
      {
        day: 5,
        title: 'National Rail Museum & Community Kitchen',
        activities: [
          { time: '09:30 AM', title: 'Gurudwara Bangla Sahib Langar Volunteering', desc: 'Witness the mega community kitchen feeding 20,000 people daily; take part in rolling rotis.' },
          { time: '12:30 PM', title: 'National Rail Museum Joy Ride', desc: 'Ride the vintage steam toy train and explore royal salon cars of the erstwhile Maharajas.' },
          { time: '04:00 PM', title: 'Connaught Place Souvenirs & Departure', desc: 'Coffee at the historic United Coffee House and departure to the airport/station.' },
        ],
      },
    ],
  },

  dehradun: {
    title: 'Dehradun & Mussoorie Himalayan Foothills Escape',
    destination: 'Dehradun, Uttarakhand, India',
    weather: '12°C – 22°C, Fresh Mountain Breeze',
    distance: '240 km from New Delhi via Delhi-Dehradun Expressway',
    stay: {
      name: 'The Riverstone Hills Chalet',
      type: 'Boutique Forest Stone Chalet',
      price: '₹3,400 / night',
      location: 'Old Mussoorie Road, Dehradun',
    },
    transport: {
      method: 'Vande Bharat Express Delhi-Dehradun + Private Mountain Cab',
      route: 'Delhi (Hazrat Nizamuddin) → Haridwar → Dehradun Valley → Mussoorie Heights (6,500 ft)',
    },
    days: [
      {
        day: 1,
        title: 'Arrival in Doon Valley, Robber’s Cave & Forest Streams',
        activities: [
          { time: '08:00 AM', title: 'Arrival via Vande Bharat Express & Check-in', desc: 'Welcome rhododendron juice at your forest chalet overlooking the Shivalik ridges.' },
          { time: '11:00 AM', title: 'Robber’s Cave (Guchhupani) River Trek', desc: 'Wade ankle-deep through a natural limestone gorge with subterranean icy streams and waterfalls.' },
          { time: '02:00 PM', title: 'Local Kumaoni & Garhwali Thali Lunch', desc: 'Savor regional specialties: Kafuli, Gahat ki Dal, Jhangore ki Kheer, and Mandua rotis.' },
          { time: '04:30 PM', title: 'Forest Research Institute (FRI) Colonial Grounds', desc: 'Walk through the majestic Greco-Roman brick architecture surrounded by 450 hectares of botanical arboretum.' },
          { time: '07:30 PM', title: 'Bonfire & Acoustic Music Night', desc: 'Relax by the stone outdoor fireplace with views of sparkling Mussoorie lights on the hills.' },
        ],
      },
      {
        day: 2,
        title: 'Tibetan Monasteries, Sahastradhara & Rajpur Cafes',
        activities: [
          { time: '09:00 AM', title: 'Mindrolling Monastery & Great Stupa', desc: 'Visit one of the largest Buddhist centers in India with a 185-ft stupa and hand-painted Tibetan murals.' },
          { time: '12:00 PM', title: 'Sahastradhara Thousandfold Sulfur Springs', desc: 'Dip in the medicinal therapeutic mineral springs amidst dripping limestone caves.' },
          { time: '02:30 PM', title: 'Artisan Cafe Hopping along Old Rajpur Road', desc: 'Coffee and woodfired sourdough pizza at Cafe de Piccolo and Barefoot Farm.' },
          { time: '05:30 PM', title: 'Tapkeshwar Mahadev Cave Shrine', desc: 'Ancient river cave where natural water droplets continuously bathe the sacred Shivalinga.' },
        ],
      },
      {
        day: 3,
        title: 'Ascent to Mussoorie & Colonial Landour Bakehouse',
        activities: [
          { time: '08:30 AM', title: 'Scenic Mountain Drive to Mussoorie (6,500 ft)', desc: 'Ascend hairpin bends with panoramic views of the entire Doon Valley below.' },
          { time: '11:00 AM', title: 'Landour Heritage Walking Trail', desc: 'Walk under tall Himalayan deodars past Char Dukan, St. Paul’s Church (1839), and Ruskin Bond’s home.' },
          { time: '01:30 PM', title: 'Lunch at the Iconic Landour Bakehouse', desc: 'Warm ginger-honey tea, apple cinnamon pie, and almond lemon cake made from 19th-century hill recipes.' },
          { time: '04:30 PM', title: 'Lal Tibba Highest Viewpoint', desc: 'Gaze through binoculars at the high Himalayan snow peaks of Badrinath, Kedarnath, and Bandarpoonch.' },
          { time: '07:30 PM', title: 'Mussoorie Mall Road Stroll & Kulhad Chai', desc: 'Shop wooden walking sticks and handmade scented candles; dinner with valley nightscapes.' },
        ],
      },
      {
        day: 4,
        title: 'George Everest Peak & Kempty Falls Adventure',
        activities: [
          { time: '09:00 AM', title: 'Hike to Sir George Everest House & Ridge', desc: 'Walk along the scenic ridge to the observatory of the British surveyor general after whom Mt. Everest was named.' },
          { time: '01:00 PM', title: 'Kempty Falls Cascades', desc: 'Visit the dramatic 40-foot waterfall cascading into natural rock pools.' },
          { time: '04:30 PM', title: 'Cloud’s End Pine Forest Walk', desc: 'Venture to the western edge of Mussoorie where thick oak and rhododendron forests drop into the Aglar River.' },
          { time: '07:30 PM', title: 'Farewell Mountain Dinner at Rokeby Manor', desc: 'Savor European countryside cuisine in a restored 1840s stone landmark.' },
        ],
      },
      {
        day: 5,
        title: 'Ruskin Bond’s Bookshop & Departure',
        activities: [
          { time: '10:00 AM', title: 'Cambridge Book Depot on Mussoorie Mall', desc: 'Pick up autographed novels and mountain memoirs.' },
          { time: '01:00 PM', title: 'Famous Stickjaw Toffees & Ellora’s Fudge', desc: 'Buy Dehradun’s legendary butter toffees and rusks.' },
          { time: '03:30 PM', title: 'Return Drive to Dehradun Station / Airport', desc: 'Board the evening express back with refreshed hill station memories.' },
        ],
      },
    ],
  },

  deoghar: {
    title: 'Deoghar Spiritual Sacred Heritage & Trikut Hills Journey',
    destination: 'Deoghar, Jharkhand, India',
    weather: '20°C – 30°C, Pleasant Autumn Climate',
    distance: '330 km from Kolkata / 250 km from Patna',
    stay: {
      name: 'Baidyanath Heritage Retreat',
      type: 'Spiritual Boutique Haveli',
      price: '₹2,600 / night',
      location: 'Near Tower Chowk, Deoghar',
    },
    transport: {
      method: 'Express Train via Jasidih Junction + Local AC Cab',
      route: 'Jasidih Railway Hub → Deoghar Sanctum → Trikut Hills Ridge → Basukinath Circuit',
    },
    days: [
      {
        day: 1,
        title: 'Sacred Baidyanath Jyotirlinga Darshan & Shivganga Tank',
        activities: [
          { time: '07:30 AM', title: 'Arrival at Jasidih Junction & Check-in', desc: 'Check in to the retreat and refresh with warm masala chai and local sweets.' },
          { time: '09:30 AM', title: 'VIP Darshan at Baba Baidyanath Dham (Kamna Linga)', desc: 'Offer holy Gangajal at one of the 12 sacred Jyotirlingas, revered as Chitabhoomi where Ravana worshipped Shiva.' },
          { time: '12:30 PM', title: 'Holy Shivganga Sacred Tank & Temple Enclave', desc: 'Walk around the sacred pond where Ravana is said to have bathed before worshipping.' },
          { time: '02:00 PM', title: 'Traditional Maithil & Bihari Bhojan', desc: 'Authentic Dal-Bati-Churma and Litti Chokha served with desi ghee.' },
          { time: '05:30 PM', title: 'Evening Shringar Aarti at Sanctum Sanctorum', desc: 'Experience the mystical evening vermillion and flowers aarti accompanied by temple conch shells.' },
        ],
      },
      {
        day: 2,
        title: 'Trikut Pahar Ropeway & Tapovan Caves',
        activities: [
          { time: '08:30 AM', title: 'Drive to Trikut Hills (The Three Peaks)', desc: 'Scenic morning excursion across forested red laterite terrain towards the 2,470 ft tri-peaked hill.' },
          { time: '10:00 AM', title: 'Trikut Ropeway & Hilltop Viewpoint', desc: 'Ride India’s scenic cable car to the summit overlooking vast sal forests and the Mayurakshi river valley.' },
          { time: '01:00 PM', title: 'Hike to Tapovan Sage Caves & Shiva Shrine', desc: 'Visit ancient hillside meditation caves where Sage Valmiki and Sri Balananda Brahmachari attained enlightenment.' },
          { time: '04:30 PM', title: 'Naulakha Mandir Marble Architectural Marvel', desc: 'Inspect the 146-ft temple dedicated to Radha-Krishna, built in 1948 by Rani Charushila with ₹9 lakh in donations.' },
          { time: '07:30 PM', title: 'Deoghar Famous Peda Tasting at Tower Chowk', desc: 'Savor freshly caramelized khoya pedas hot from the wok at century-old sweetmakers.' },
        ],
      },
      {
        day: 3,
        title: 'Basukinath Pilgrimage Circuit & Nandan Pahar',
        activities: [
          { time: '08:30 AM', title: 'Day Excursion to Basukinath Temple (42 km)', desc: 'Complete the sacred twin circuit; pilgrimage to Baidyanath is traditionally completed with Basukinath darshan.' },
          { time: '01:30 PM', title: 'Satwik Mahaprasad Lunch', desc: 'Devotional temple feast with khichdi, kheer, and mixed vegetable labra.' },
          { time: '04:30 PM', title: 'Nandan Pahar Sunset Garden & Lake', desc: 'Relax in the hill park overlooking the town with serene sunset views.' },
          { time: '07:30 PM', title: 'Departure from Jasidih Junction', desc: 'Board the evening express with blessed holy souvenirs and peda gift boxes.' },
        ],
      },
    ],
  },

  manali: {
    title: 'Manali Alpine Retreat & High Valley Expedition',
    destination: 'Manali, Himachal Pradesh, India',
    weather: '5°C – 14°C, Crisp Alpine Sunshine',
    distance: '540 km from New Delhi via NH44 & Kiratpur-Manali 4-Lane',
    stay: {
      name: 'The Himalayan Stay',
      type: 'Boutique Cedarwood Chalet',
      price: '₹2,800 / night',
      location: 'Old Manali, amidst apple orchards',
    },
    transport: {
      method: 'Overnight Gold Class Volvo Coach + Local 4x4 Mountain Cab',
      route: 'Delhi (Majnu Ka Tilla) → Chandigarh → Mandi → Kullu Valley → Old Manali',
    },
    days: [
      {
        day: 1,
        title: 'Arrival in Manali, Hadimba Temple & Bohemian Cafes',
        activities: [
          { time: '08:30 AM', title: 'Check in to The Himalayan Stay & Welcome Drink', desc: 'Arrive in Old Manali, breathe fresh pine air, and sip hot Himalayan apple-cinnamon tea.' },
          { time: '11:00 AM', title: 'Hadimba Devi 16th-Century Wooden Temple', desc: 'Walk under towering deodars around the pagoda-style sanctuary built in 1553 by Maharaja Bahadur Singh.' },
          { time: '01:30 PM', title: 'Riverside Lunch at Cafe 1947', desc: 'Woodfired trout pizza, pasta, and freshly brewed herbal infusions beside the gushing Manalsu river.' },
          { time: '04:00 PM', title: 'Vashisht Natural Sulfur Hot Springs', desc: 'Take a therapeutic dip in 4000-year-old hot mineral springs overlooking the Beas valley.' },
          { time: '07:30 PM', title: 'Acoustic Bonfire & Stargazing', desc: 'Sit around the cedarwood campfire sharing stories with co-travelers.' },
        ],
      },
      {
        day: 2,
        title: 'Jogini Waterfalls Forest Hike & Manu Temple',
        activities: [
          { time: '09:00 AM', title: 'Trek to Jogini Waterfalls', desc: 'Hike 4 km through pine forests and apple orchards to cascade pools where locals bathe in holy waters.' },
          { time: '01:00 PM', title: 'Himachali Siddu & Pahari Lunch', desc: 'Taste steamed wheat dumplings stuffed with walnut-poppy seed paste and dipped in pure desi ghee.' },
          { time: '03:30 PM', title: 'Historic Manu Temple & Old Manali Village', desc: 'Visit the only temple in India dedicated to the creator Sage Manu; explore rustic wooden houses.' },
          { time: '06:30 PM', title: 'Live Music Jam at Dylan’s Toasted & Roasted', desc: 'Enjoy dark chocolate cookies and live acoustic folk music.' },
        ],
      },
      {
        day: 3,
        title: 'Solang Valley Adventure & The Atal Tunnel to Sissu',
        activities: [
          { time: '08:30 AM', title: 'Scenic Mountain Drive to Solang Valley', desc: 'Spot paragliders against Friendship Peak and glaciers.' },
          { time: '11:00 AM', title: 'Traverse the 9.02 km Atal Tunnel', desc: 'Pass through the world’s longest highway tunnel into the dramatic trans-Himalayan desert of Lahaul Valley.' },
          { time: '01:00 PM', title: 'Sissu Glacial Waterfall & Chandra River', desc: 'Witness towering glacial cascades plunging into turquoise river pools amidst willow groves.' },
          { time: '05:30 PM', title: 'Steaming Momos & Thukpa Stop at Nehru Kund', desc: 'Warm up with spicy garlic chutney and hot noodle soup.' },
        ],
      },
      {
        day: 4,
        title: 'Naggar Royal Castle & Nicholas Roerich Art Estate',
        activities: [
          { time: '09:30 AM', title: 'Naggar Castle (Former Royal Seat of Kullu)', desc: 'Explore 500-year-old earthquake-proof Kathkuni architecture overlooking the entire Beas river valley.' },
          { time: '01:00 PM', title: 'Nicholas Roerich Himalayan Art Gallery', desc: 'Inspect vivid oil paintings capturing mystical Himalayan passes by the Russian master.' },
          { time: '04:30 PM', title: 'Mall Road Handloom Shawls & Mountain Honey', desc: 'Shop authentic Kullu pashmina shawls, apple jams, and handmade woolen socks.' },
        ],
      },
      {
        day: 5,
        title: 'Forest Bathing in Van Vihar & Evening Departure',
        activities: [
          { time: '10:00 AM', title: 'Pine Trail Walk in Van Vihar Nature Park', desc: 'Peaceful walk among centuries-old deodars beside the Beas river.' },
          { time: '01:00 PM', title: 'Farewell Brunch at The Lazy Dog Lounge', desc: 'Relax on the outdoor wooden deck overlooking the river.' },
          { time: '04:30 PM', title: 'Board Evening Luxury Volvo Coach to Delhi', desc: 'Depart with unforgettable Himalayan memories and new travel buddies.' },
        ],
      },
    ],
  },

  'spiti-valley': {
    title: 'Spiti Valley: The Middle Land Odyssey',
    destination: 'Spiti Valley, Himachal Pradesh, India',
    weather: '-2°C – 12°C, Crystal High-Altitude Skies',
    distance: '720 km Circuit from Delhi via Kinnaur & Kunzum Pass',
    stay: {
      name: 'Spiti Celestial Homestays & Swiss Tents',
      type: 'Authentic Tibetan Mud-Brick Homestays',
      price: '₹2,200 / night',
      location: 'Kaza & Chandratal Camp',
    },
    transport: {
      method: 'Force Urbania 4x4 Mountain Cruiser',
      route: 'Delhi → Shimla → Narkanda → Sangla → Kalpa → Tabo → Kaza → Chandratal → Manali',
    },
    days: [
      {
        day: 1,
        title: 'Delhi to Narkanda / Rampur Gateway',
        activities: [
          { time: '06:00 AM', title: 'Departure from Delhi via Himalayan Expressway', desc: 'Scenic mountain climb into the Shivalik pine hills above Shimla.' },
          { time: '02:00 PM', title: 'Narkanda Apple Orchard Panorama', desc: 'View the snow ridges of the Greater Himalayas from Hatu Peak.' },
        ],
      },
      {
        day: 2,
        title: 'Narkanda to Sangla & Chitkul (The Last Indian Village)',
        activities: [
          { time: '08:30 AM', title: 'Drive through Kinnaur Valley alongside Baspa River', desc: 'Marvel at roads carved directly out of solid vertical granite cliffs.' },
          { time: '03:00 PM', title: 'Walk the Wooden Houses of Chitkul', desc: 'Visit the last inhabited village on the Indo-Tibet border and touch the glacial waters of the Baspa.' },
        ],
      },
      {
        day: 3,
        title: 'Chitkul to Kalpa & Nako Sacred Lake',
        activities: [
          { time: '06:00 AM', title: 'Sunrise over Kinnaur Kailash Peak', desc: 'Watch golden light ignite the sacred 6,050m Shiva peak.' },
          { time: '02:00 PM', title: 'Khab Sangam & Nako High-Altitude Lake', desc: 'Confluence of Spiti and Sutlej rivers; walk around the sacred willow-bordered lake.' },
        ],
      },
      {
        day: 4,
        title: 'Nako to 1000-Year-Old Tabo & Dhankar Monastery',
        activities: [
          { time: '09:00 AM', title: 'Tabo UNESCO World Heritage Monastery', desc: 'Step inside the Ajanta of the Himalayas with 996 AD clay sculptures and ancient frescoes.' },
          { time: '02:30 PM', title: 'Dhankar Cliffside Monastery & Spiti River Confluence', desc: 'Perched dramatically on razor-sharp mud spires overlooking the Pin-Spiti river junction.' },
          { time: '06:00 PM', title: 'Arrive in Kaza Town (Spiti Headquarters)', desc: 'Check in to cozy mud homestay; hot butter tea and momos.' },
        ],
      },
      {
        day: 5,
        title: 'World’s Highest Post Office, Fossil Village & Komic',
        activities: [
          { time: '09:00 AM', title: 'Hikkim Highest Post Office in the World (14,567 ft)', desc: 'Send physical postcards stamped with the iconic high-altitude postal seal to family.' },
          { time: '12:00 PM', title: 'Komic (World’s Highest Motorable Village - 15,027 ft)', desc: 'Visit Tangyud Monastery and sip Seabuckthorn tea in the clouds.' },
          { time: '03:30 PM', title: 'Langza Giant Golden Buddha & Marine Fossils', desc: 'Gaze at the 1000-year-old Buddha facing Chau Chau Kang Nilda peak; find Tethys Sea ammonite fossils.' },
        ],
      },
      {
        day: 6,
        title: 'Key Gompa Fortress Monastery & Asia’s Highest Bridge',
        activities: [
          { time: '09:00 AM', title: 'Key Monastery Fortress & Monks Library', desc: 'Iconic multi-tiered white monastery perched on a hilltop like a medieval castle.' },
          { time: '02:00 PM', title: 'Chicham Suspension Bridge (13,596 ft)', desc: 'Walk across the engineering marvel spanning a dizzying 1,000 ft deep gorge.' },
        ],
      },
      {
        day: 7,
        title: 'Kunzum Pass Summit (14,931 ft) & Chandratal Moon Lake',
        activities: [
          { time: '08:30 AM', title: 'Cross Kunzum La with Prayer Flags', desc: 'Circumambulate the Kunzum Mata temple shrine for mountain blessings.' },
          { time: '02:00 PM', title: 'Trek down to Chandratal (The Moon Lake)', desc: 'Marvel at crescent-shaped crystal turquoise waters changing shades under alpine skies.' },
          { time: '08:30 PM', title: 'Milky Way Stargazing at High-Altitude Camp', desc: 'Witness thousands of glittering stars and shooting meteors at 14,000 feet.' },
        ],
      },
      {
        day: 8,
        title: 'Chandratal to Manali via Atal Tunnel & Return',
        activities: [
          { time: '07:30 AM', title: 'Drive past Batal & Gramphu Boulder Fields', desc: 'Breakfast at the legendary Chacha-Chachi Dhaba in Batal.' },
          { time: '02:30 PM', title: 'Traverse Atal Tunnel into Manali', desc: 'Celebrate completing the legendary Middle Land circuit.' },
        ],
      },
    ],
  },

  goa: {
    title: 'Goa Coastal Serenity, Secret Lagoons & Heritage Trails',
    destination: 'Goa (North & South), India',
    weather: '24°C – 32°C, Warm Tropical Sunshine',
    distance: 'Direct Flights to Mopa (GOX) / Dabolim (GOI)',
    stay: {
      name: 'Casa De Portuguese Heritage Villa',
      type: '18th-Century Restored Portuguese Estate with Pool',
      price: '₹3,800 / night',
      location: 'Vagator Cliffs, North Goa',
    },
    transport: {
      method: 'Scooter Rentals + Private AC Innova for Day Excursions',
      route: 'North Goa Coastal Strip → Old Panaji Heritage → South Goa Pristine Coves',
    },
    days: [
      {
        day: 1,
        title: 'Arrival, Vagator Cliffs & Sunset Sundowners',
        activities: [
          { time: '12:00 PM', title: 'Check in to Portuguese Villa & Poolside Dip', desc: 'Sip fresh coconut water amidst bougainvillea courtyards and swaying coconut palms.' },
          { time: '04:30 PM', title: 'Chapora Fort (Dil Chahta Hai) Sunset Walk', desc: 'Climb red laterite ramparts overlooking the meeting of the Chapora river and the Arabian Sea.' },
          { time: '07:30 PM', title: 'Sunset Cocktails at Thalassa / Titlie', desc: 'Enjoy Mediterranean mezze, live saxophone music, and the sun melting into the ocean.' },
        ],
      },
      {
        day: 2,
        title: 'Fontainhas Latin Quarter & Sahakari Spice Farm',
        activities: [
          { time: '09:30 AM', title: 'Walking Photo Tour of Fontainhas, Panaji', desc: 'Explore brightly painted Portuguese villas in ochre, indigo, and terracotta with oyster-shell windows.' },
          { time: '12:30 PM', title: 'Authentic Goan Poi & Prawn Balchão at Viva Panjim', desc: 'Savor traditional family-recipe Goan Christian cuisine in a historic alley tavern.' },
          { time: '03:00 PM', title: 'Sahakari Spice Plantation Guided Walk', desc: 'Learn how black pepper, vanilla, and peri-peri grow; enjoy an herbal elephant welcome.' },
          { time: '07:00 PM', title: 'Mandovi River Sunset Catamaran Cruise', desc: 'Sail past Panaji waterfront with live Konkani folk dancers and sea breeze.' },
        ],
      },
      {
        day: 3,
        title: 'South Goa Hidden Paradise: Cola Lagoon & Cabo de Rama',
        activities: [
          { time: '08:30 AM', title: 'Scenic Coastal Drive to South Goa', desc: 'Pass through lush paddy fields, ancient churches, and serene sleepy villages.' },
          { time: '11:00 AM', title: 'Cabo de Rama Medieval Cliff Fort', desc: 'Stand on towering rocky capes where Lord Rama is said to have rested in exile.' },
          { time: '02:00 PM', title: 'Kayaking in Cola Beach Emerald Lagoon', desc: 'A secluded freshwater lagoon surrounded by palm trees opening directly into the ocean.' },
          { time: '05:30 PM', title: 'Sunset at Palolem Beach Crescent Bay', desc: 'Walk barefoot on white powdery sand as fishing boats return with the evening catch.' },
        ],
      },
      {
        day: 4,
        title: 'Anjuna Flea Markets, Beach Shacks & Farewell Dinner',
        activities: [
          { time: '10:00 AM', title: 'Anjuna Hippie Flea Market & Handicrafts', desc: 'Shop handmade silver jewelry, Tibetan singing bowls, and bohemian linen shirts.' },
          { time: '02:00 PM', title: 'Beach Shack Chilling at Ashwem / Morjim', desc: 'Lie on wooden daybeds, order fresh calamari and cold kokum coolers.' },
          { time: '07:30 PM', title: 'Celebratory Seafood Dinner at Martin’s Corner', desc: 'Crab Xec Xec, butter garlic lobster, and traditional bebinca dessert.' },
        ],
      },
      {
        day: 5,
        title: 'Morning Yoga, Souvenirs & Airport Departure',
        activities: [
          { time: '08:00 AM', title: 'Sunrise Beach Yoga & Swim', desc: 'Gentle morning yoga session on the tranquil sands of Mandrem.' },
          { time: '11:00 AM', title: 'Cashew & Feni Souvenir Shopping', desc: 'Pick up roasted cashews and authentic spiced feni.' },
          { time: '02:00 PM', title: 'Airport Drop to Mopa / Dabolim', desc: 'Depart sun-kissed and energized.' },
        ],
      },
    ],
  },
};

// Procedural Generator for ANY destination (Never random; structurally tailored!)
export function generateItinerary({
  destination = 'Manali, Himachal Pradesh',
  duration = 5,
  travelers = 2,
  budget = 18500,
  travelStyle = 'Adventure',
  interests = ['Nature', 'Food'],
}) {
  const cleanKey = destination.toLowerCase().trim();

  // Find exact curated match or partial match
  let matchedKey = Object.keys(CURATED_ITINERARIES).find((key) =>
    cleanKey.includes(key) || key.includes(cleanKey.split(/[\s,]+/)[0])
  );

  let curated = null;
  if (matchedKey) {
    curated = CURATED_ITINERARIES[matchedKey];
  }

  const durationNum = Math.max(2, Math.min(14, Number(duration) || 5));
  const travelersNum = Math.max(1, Number(travelers) || 2);
  const budgetNum = Math.max(4000, Number(budget) || 18500);

  // If curated match exists, adapt its days to the requested duration
  let dayByDay = [];
  if (curated && curated.days) {
    if (curated.days.length >= durationNum) {
      dayByDay = curated.days.slice(0, durationNum);
    } else {
      dayByDay = [...curated.days];
      // Append logical extra days
      const extraNeeded = durationNum - curated.days.length;
      for (let i = 0; i < extraNeeded; i++) {
        const dayIdx = curated.days.length + i + 1;
        dayByDay.push({
          day: dayIdx,
          title: `Day ${dayIdx}: Secret Trails & Local Hidden Gems`,
          activities: [
            { time: '09:30 AM', title: 'Off-the-Beaten-Path Exploration', desc: `Guided backcountry trail discovering hidden viewpoints and tranquil groves around ${destination.split(',')[0]}.` },
            { time: '01:30 PM', title: 'Farm-to-Table Organic Lunch', desc: 'Taste locally grown produce and artisanal herbal teas at a hillside cafe.' },
            { time: '05:00 PM', title: 'Golden Hour Photography & Stargazing', desc: 'Capture panoramic mountain ridges as twilight blankets the valley.' },
          ],
        });
      }
    }
  } else {
    // Intelligently synthesize realistic days for ANY custom destination
    const cityName = destination.split(',')[0].trim();
    dayByDay = Array.from({ length: durationNum }, (_, i) => {
      const dayNum = i + 1;
      if (dayNum === 1) {
        return {
          day: 1,
          title: `Arrival, Check-in & ${cityName} Old Town Walk`,
          activities: [
            { time: '09:00 AM', title: `Arrival in ${cityName} & Welcome Refreshment`, desc: 'Check in to your boutique hillside stay, unpack and savor a local welcome drink.' },
            { time: '11:30 AM', title: `Historic Heritage & Landmarks Tour`, desc: `Walk through ancient lanes and famous colonial/monumental landmarks of ${cityName}.` },
            { time: '01:30 PM', title: 'Authentic Regional Culinary Lunch', desc: 'Savor traditional family recipes and street specialties loved by locals.' },
            { time: '05:00 PM', title: 'Sunset Viewpoint Promenade', desc: 'Relax at the highest panoramic sunset terrace with hot chai.' },
            { time: '08:00 PM', title: 'Welcome Group Dinner & Bonfire', desc: 'Meet fellow travelers and review the journey plan for the week.' },
          ],
        };
      } else if (dayNum === durationNum) {
        return {
          day: dayNum,
          title: `Local Craft Bazaars & Departure with Memories`,
          activities: [
            { time: '09:00 AM', title: 'Artisan Market & Souvenir Shopping', desc: `Shop pure handlooms, organic honey, and handmade handicrafts from local artisans in ${cityName}.` },
            { time: '12:30 PM', title: 'Farewell Brunch at Scenic Cafe', desc: 'Enjoy signature desserts and swap photos with newly made buddies.' },
            { time: '03:30 PM', title: 'Board Return Coach / Flight', desc: `Depart ${cityName} with refreshed spirits and lifetime memories.` },
          ],
        };
      } else if (dayNum === 2) {
        return {
          day: 2,
          title: `Nature Trails, Waterfalls & Adventure Activities`,
          activities: [
            { time: '08:30 AM', title: 'Alpine Pine Ridge / Coastal Trail Hike', desc: `Trek through untouched nature reserves and fragrant tree canopies around ${cityName}.` },
            { time: '01:00 PM', title: 'Picnic beside Natural Cascades', desc: 'Fresh packed lunch beside crystal clear mountain brooks.' },
            { time: '03:30 PM', title: `${travelStyle} Highlight Experience`, desc: `Engage in tailored ${travelStyle.toLowerCase()} adventures: local workshops, viewpoint climbs, and cultural immersion.` },
            { time: '07:30 PM', title: 'Stargazing & Campfire Session', desc: 'Observe clear constellations with acoustic music.' },
          ],
        };
      } else {
        return {
          day: dayNum,
          title: `Day ${dayNum}: Hidden Valleys, Monasteries & Secret Spots`,
          activities: [
            { time: '09:00 AM', title: 'Morning Sacred Shrine & Heritage Exploration', desc: 'Immerse in ancient architecture, bell chimes, and spiritual tranquility.' },
            { time: '01:30 PM', title: 'Regional Cafe Hopping', desc: 'Try organic bakes, herbal teas, and regional delicacy platters.' },
            { time: '05:00 PM', title: 'Golden Hour Photography Session', desc: 'Capture panoramic vistas from secluded high cliffs.' },
            { time: '08:00 PM', title: 'Evening Acoustic Dinner', desc: 'Delicious multi-course dinner with live local music.' },
          ],
        };
      }
    });
  }

  // Construct Realistic Budget Allocation Breakdown
  const totalBudget = Math.round(budgetNum * (travelersNum > 1 ? travelersNum * 0.88 : 1));
  const stayCost = Math.round(totalBudget * 0.40);
  const transportCost = Math.round(totalBudget * 0.28);
  const activitiesCost = Math.round(totalBudget * 0.18);
  const foodCost = Math.round(totalBudget * 0.14);

  const budgetBreakdown = [
    { category: `Boutique Stay (${durationNum - 1} Nights)`, amount: stayCost, percentage: 40 },
    { category: 'Private Transport & Sightseeing Cabs', amount: transportCost, percentage: 28 },
    { category: 'Activities, Guided Treks & Permits', amount: activitiesCost, percentage: 18 },
    { category: 'Authentic Meals & Mountain Cafes', amount: foodCost, percentage: 14 },
  ];

  const stayRec = curated?.stay || {
    name: `The ${destination.split(',')[0]} Heritage Chalet`,
    type: 'Boutique Wooden Cottage & Retreat',
    price: `₹${Math.round(stayCost / Math.max(1, durationNum - 1)).toLocaleString('en-IN')} / night`,
    location: `Central ${destination.split(',')[0]}, panoramic valley views`,
  };

  const transportRec = curated?.transport || {
    method: 'Private Mountain SUV / Luxury AC Volvo Coach',
    route: `Major City Hub → Scenic Expressway → ${destination.split(',')[0]} Gateway`,
  };

  return {
    tripTitle: `${destination.split(',')[0]} ${travelStyle} Journey`,
    destination,
    duration: `${durationNum} Days / ${durationNum - 1} Nights`,
    travelers: travelersNum,
    totalBudget,
    weather: curated?.weather || '14°C – 24°C, Pleasant Sunshine & Clear Skies',
    distance: curated?.distance || `380 km Scenic Route to ${destination.split(',')[0]}`,
    travelStyle,
    interests,
    stayRecommendation: stayRec,
    transportRecommendation: transportRec,
    budgetBreakdown,
    dayByDay,
  };
}
