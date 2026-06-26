export interface SportPathway {
  id: string;
  name: string;
  progression: string[];
  selectionProcess: string;
  requiredSkills: string[];
  fitnessStandards: string;
  trainingGuidance: string;
  careerOpportunities: string[];
  earningsPotential: string;
  hardwareRequirements?: string; // specific to Esports
  practicePlans?: string; // specific to Esports
  teamSelection?: string; // specific to Esports
}

export const OUTDOOR_SPORTS: SportPathway[] = [
  {
    id: "cricket",
    name: "Cricket",
    progression: [
      "School Team / Local Coaching Academy",
      "District Selection Trials (Under-14 / Under-16)",
      "State Level Representative Teams (Vijay Merchant Trophy)",
      "Zonal Selection / National Under-19 Camp (Cooch Behar Trophy)",
      "Ranji Trophy / Domestic First-Class tournaments",
      "Indian Premier League (IPL) Franchise Selection",
      "India 'A' Representative developmental tours",
      "Indian National Cricket Team (International Cap)"
    ],
    selectionProcess: "Regulated annual open district trials, leading to state selection board shortlists based on statistics in multi-day BCCI-affiliated junior state tournaments.",
    requiredSkills: [
      "Technical batting stance & strokeplay",
      "Line & length variations for bowlers",
      "Reflex slip-fielding posture",
      "Pitch assessment & tactfulness"
    ],
    fitnessStandards: "Yo-Yo endurance test minimum score of 16.5+, sprint speeds inside 2.9 seconds for 20m, and highly resilient hand-eye co-ordination drills.",
    trainingGuidance: "Combine 2 hours of net batting/bowling practice daily with 1 hour of active fielding drills. Focus intensely on strength conditioning and resistance training.",
    careerOpportunities: ["Professional Domestic/IPL Player", "BCCI Grade Umpire / Referee", "State Level Head Coach", "Sports Commentator", "Performance Analyst"],
    earningsPotential: "Domestic: ₹15L - ₹40L/annum, IPL Matches: ₹20L to ₹15 Crore+/season, National Cap: ₹1 Crore - ₹7 Crore+ central annual contracts."
  },
  {
    id: "football",
    name: "Football",
    progression: [
      "Local School/Community Club matches",
      "District Sub-Junior Selection tournaments",
      "State Representative Team (Santosh Trophy Junior)",
      "Elite Professional Academy Scouts (AIFF Accreditations / ISL Academies)",
      "Professional Reserves Squad / I-League representation",
      "Indian Super League (ISL) Pro Draft / Signing",
      "National Under-23 Team Camps",
      "Senior Indian National Football Team (Blue Tigers)"
    ],
    selectionProcess: "Active scouting by certified AIFF recruiters during national school championships (Subroto Cup) and state league divisions.",
    requiredSkills: [
      "Precise ball control & passing range",
      "Positional tactical awareness",
      "Defensive tracking or clinical finishing",
      "Speed of play under pressure"
    ],
    fitnessStandards: "Extremely high aerobic capacity (VO2 Max > 60 ml/kg/min), speed endurance (10km cumulative run with high-intensity intermittent sprints).",
    trainingGuidance: "Interval sprint routines, tactical defensive/offensive spatial positioning boards, and 90-minute small-sided practice matches thrice a week.",
    careerOpportunities: ["ISL / I-League Professional Athlete", "Certified AIFF / AFC Coach", "Corporate League Manager", "Sports Physiotherapist"],
    earningsPotential: "I-League: ₹3L - ₹15L/annum, ISL Professionals: ₹15L to ₹1.5 Crore+/annum, National Contract base allowances."
  },
  {
    id: "hockey",
    name: "Hockey",
    progression: [
      "School Team / Regional Sports Hostel",
      "District Junior Leagues",
      "State Representation (Sub-Junior Nationals)",
      "National Hockey Academies (e.g. SAIL, RoundGlass, Odisha)",
      "Hockey India League (HIL) Franchise selection",
      "National Junior Camp Selection",
      "India 'A' Teams representation",
      "Indian National Hockey Team (Olympics / World Cup)"
    ],
    selectionProcess: "Outstanding performance tracking in National Sub-Junior, Junior, and Senior Level Championships handled by Hockey India selection representatives.",
    requiredSkills: ["3D stick dribbling agility", "Flick & drag-flick precision", "Aggressive interceptive tackling", "High-velocity accurate passing"],
    fitnessStandards: "Multistage Beep Test score of 13.5+; extreme physical durability to withstand body checks and full-speed turf running.",
    trainingGuidance: "Turf fitness sprints, tactical counter-attacking drills, penalty corner set-pieces execution repetitions, 4-way spatial positioning.",
    careerOpportunities: ["Professional HIL Player", "Corporate/Public Sector PSU Recruits", "Certified Coach", "Video Performance Analyst"],
    earningsPotential: "PSU Employment (Job Security): ₹5L - ₹12L/annum, Franchise League Contracts: ₹10L - ₹50L/season, International representation allowances."
  },
  {
    id: "kabaddi",
    name: "Kabaddi",
    progression: [
      "Village / School Local Club Trials",
      "District Amateur Kabaddi Federations tournaments",
      "Junior State Championships",
      "National Kabbadi Championships representation",
      "Pro Kabaddi League (PKL) New Young Players (NYP) Program Trials",
      "PKL Franchise Reserve squad selection",
      "Main PKL Professional Matches roster",
      "Indian National Kabaddi Team representation"
    ],
    selectionProcess: "State amateur boards screen candidates. Direct professional scouting via Pro Kabaddi New Young Player open country selection trails.",
    requiredSkills: ["Ankle-hold reflex timing", "Thigh-hold tackling power", "Clean escape diving techniques", "Continuous 'Kabbadi' chant respiration control"],
    fitnessStandards: "High core leverage physical power (Squats 1.5x body weight), explosive agility, and dynamic split-second wrestling defense structures.",
    trainingGuidance: "Wrestling-style mat grappling drills, 30-meter high-knee sprint acceleration intervals, and intense calisthenics training.",
    careerOpportunities: ["PKL Franchise Athlete", "State Police/Railway Quota Sports Officer", "Youth Kabaddi Academy coach"],
    earningsPotential: "PKL Contracts: ₹6L (Base) to ₹1.5 Crore+ (Elite Category), along with high-status central government class-A job placements."
  },
  {
    id: "volleyball",
    name: "Volleyball",
    progression: [
      "Inter-School tournaments",
      "District Sports Authority coaching camp",
      "State Representative Squad (Junior National Trials)",
      "Prime Volleyball League (PVL) Draft Selection",
      "Hindustan Club Level Divisions matches",
      "Senior National Volleyball Championships representing state/PSU",
      "Indian National Volleyball Team"
    ],
    selectionProcess: "Scouting boards pick tall athletes based on vertical hop, wingspan metrics, and spike stats in school nationals and PVL open combines.",
    requiredSkills: ["High-accuracy jump serving", "Flawless block setups", "Defensive dig transitions", "Set accuracy positioning"],
    fitnessStandards: "Vertical leap clearance > 95cm, rapid upper-body shoulder rotational power, and lateral fast-shuffled feet movements.",
    trainingGuidance: "Plyometric box jumps, resistance band jump training, set-to-spike transitions, and rotational shoulder rotator cuff stability workouts.",
    careerOpportunities: ["PVL Player", "Public Sector Sports Executive (customs, railways)", "Academy Volley Guide"],
    earningsPotential: "Domestic: ₹2L - ₹8L/annum, PVL Franchise Draft: ₹5L - ₹25L/season, permanent government athletic tenure."
  },
  {
    id: "basketball",
    name: "Basketball",
    progression: [
      "School Core Squad / YMCA Academies",
      "District Inter-Club Championships",
      "Youth State Selection Team (Sub-Junior Nationals)",
      "National youth elite camps (NBA Academy India selects)",
      "Senior National Basketball Championships",
      "National Elite Professional Leagues / Overseas College Scout recruitments",
      "Indian National Basketball Team (FIBA representation)"
    ],
    selectionProcess: "Outstanding performance scouts during Basketball Federation of India (BFI) National Championships and individual evaluations.",
    requiredSkills: ["Tight ball handling & crossover dribbles", "High-percentage perimeter shooting", "Defensive screen blocking", "Fast court transition speed"],
    fitnessStandards: "Elite vertical jump, rapid multi-directional suicide sprints, and durable core stamina for physical screen interactions.",
    trainingGuidance: "Continuous 500-shot drills daily, high-intensity perimeter defensive foot shuffles, custom core stability planks, and set plays.",
    careerOpportunities: ["Pro Basketball Athlete", "NBA Academy Coach", "Overseas Collegiate Scholar", "Broadcasting Analyst"],
    earningsPotential: "Domestic/Government: ₹4L - ₹10L/annum, Foreign Leagues / Scholarships: full tuition coverage, Indian National: ₹5L - ₹20L/annum."
  },
  {
    id: "tennis",
    name: "Tennis",
    progression: [
      "AITA Under-10 / Under-12 Talent Series (TS)",
      "AITA Championship Series (CS) & Super Series (SS) tournaments",
      "AITA National Series (NS) & National Junior Championships",
      "ITF Junior Circuit Tournaments (Grade 1 - 5)",
      "ITF Men's/Women's World Tennis Tour (Futures & Challengers)",
      "ATP / WTA International Professional Tour tournaments",
      "Davis Cup / Billie Jean King Cup Indian Team Representative"
    ],
    selectionProcess: "Rankings based purely on accumulated All India Tennis Association (AITA) active points list and subsequent international ITF ranks.",
    requiredSkills: ["High-speed tennis serves", "Flawless baseline rallies", "Dynamic backhand/forehand spins", "High-stress court composure"],
    fitnessStandards: "Elite aerobic stamina, high-acceleration recovery shuffles, and dynamic single-arm shoulder racquet acceleration power.",
    trainingGuidance: "Spend 3 hours on court daily practicing groundstrokes and serving accuracy. Combine with 1.5 hours of speed, strength, and reaction drills.",
    careerOpportunities: ["ATP/WTA Touring Athlete", "High-Performance Academy Coach", "Grand Slam Sparring Partner", "National Academy Coordinator"],
    earningsPotential: "Prize Money: $5,000 to $2 Million+ based on ATP/WTA draw progression. Domestic coaching / management: ₹6L - ₹20L/annum."
  },
  {
    id: "athletics",
    name: "Athletics (Sprints / Jumps / Throws)",
    progression: [
      "School Athletic Meet / Inter-School Championships",
      "District Annual Track & Field Events",
      "State Athletics Championships representation",
      "National Junior Athletics Meet (AFI Sanctioned)",
      "National Sports Authority of India (SAI) Center Scouting",
      "National Federation Cup / Senior Athletics meets",
      "International Grand Prix / Olympic & Commonwealth athletic trials"
    ],
    selectionProcess: "Strictly performance-based. Meeting Olympic/AFI qualification marks in timing, distance, or height in accredited meets.",
    requiredSkills: ["Explosive block starts (Sprints)", "High kinetic energy block translation", "Rotational momentum control (Throws)", "Aerobic VO2 threshold"],
    fitnessStandards: "World-class fast-twitch muscle fiber density, optimized low body fat percentage (typically <8% for men, <15% for women).",
    trainingGuidance: "Sprint interval drills, Olympic weightlifting (cleans, snatches) for explosive power, and customized lactic acid tolerance training.",
    careerOpportunities: ["Olympic Representing Athlete", "SAI Athletic Director", "Elite Personal Trainer", "Sports Scientist"],
    earningsPotential: "AFI/Government Support: ₹5L - ₹12L/annum, Corporate sponsorship deals: ₹10L to ₹2 Crore+/annum based on medal achievements."
  },
  {
    id: "archery",
    name: "Archery (Recurve / Compound)",
    progression: [
      "District Archery Club enrollment",
      "State Archery Association trials",
      "Junior National Archery Championships",
      "SAI Elite Academy Selection (Tata Archery / Army Sports Institute)",
      "National Archery Ranking Tournaments",
      "World Cup Stage Selection",
      "Indian Archery Team representation (Olympics / Asian Games)"
    ],
    selectionProcess: "Based on overall selection trials score matrix and active arrow performance logs overseen by the Archery Association of India (AAI).",
    requiredSkills: ["Micro-millimetric aim consistency", "High upper back drawing strength", "Steady breathing control", "High wind-analysis cognition"],
    fitnessStandards: "Outstanding core posture, isometric shoulder and back shoulder muscle endurance, and low resting heart rate under high target pressure.",
    trainingGuidance: "Bow draw-holding drill intervals (up to 45 seconds holds), daily release of 200+ arrows, mindfulness breathing exercises, back strengthening.",
    careerOpportunities: ["National Team Archer", "Defense/Railway Quota Officer", "Accredited Equipment Consultant", "Target Coach"],
    earningsPotential: "Government grants/tenure: ₹4L - ₹10L/annum, Cash awards for international podium positions: up to ₹1 Crore+ from state cabinets."
  },
  {
    id: "shooting",
    name: "Shooting (Rifle / Pistol / Shotgun)",
    progression: [
      "Affiliated Rifle Club basic certification training",
      "District Shooting Championships (NRAI Sanctioned)",
      "State Level Competitions (Qualifying score for Pre-Nationals)",
      "All India G.V. Mavalankar Shooting Championship",
      "National Shooting Championship Competitions (NSCC)",
      "National Squad Trials (Rank list based on top averages)",
      "ISSF World Cup Stages representational shooter",
      "Indian Olympic Shooting Contingent"
    ],
    selectionProcess: "Securing national-level qualifying scores (MQS) at NSCC to enter the National Trails pool which monitors monthly average scores.",
    requiredSkills: ["Elite trigger control & trigger squeeze", "Optimal stance alignment", "Exceptional visual focus", "Heart rate stabilization"],
    fitnessStandards: "Outstanding isometric endurance, steady arm hold without micro-tremors, and optimal mental visual coordination.",
    trainingGuidance: "Dry-firing practice daily (1 hour), live target range shooting (100 rounds), yoga-based resting heart rate control, and shoulder alignment.",
    careerOpportunities: ["Olympic Sport Shooter", "National Academy Coach", "Ballistics consultant", "Elite Range Operations Director"],
    earningsPotential: "Corporate sponsorships (highly prominent): ₹15L - ₹50L/annum, Government cash rewards for international medals: ₹25L to ₹2 Crore+."
  },
  {
    id: "wrestling",
    name: "Wrestling (Freestyle / Greco-Roman)",
    progression: [
      "Traditional Akharas / Rural wrestling arenas",
      "District Dangals / Selection Trials",
      "State Wrestling Championships (Sub-Junior / Cadet)",
      "National Wrestling Championships (WFI Sanctioned)",
      "SAI National Center of Excellence selection",
      "National Coaching Camps (Patiala / Sonepat)",
      "Senior World Championships & Olympic Wrestling team"
    ],
    selectionProcess: "Strictly knock-out trials in respective weight categories organized by the Wrestling Federation of India prior to international tours.",
    requiredSkills: ["High-power leverage takedowns", "Strong defensive bridges", "Explosive arm throws & pins", "Match tactical situational logic"],
    fitnessStandards: "Elite full-body grip strength, dynamic weight-handling core power, and extreme anaerobic cardiovascular recovery levels.",
    trainingGuidance: "Mat sparring sessions, high-power heavy sandbag squats, pull-up variations (weighted), endurance wrestling drill iterations.",
    careerOpportunities: ["Pro-Leagues Athlete", "Government Sports Officer (DSP ranks)", "Wrestling Academy Master"],
    earningsPotential: "Permanent Class-A DSP police roles, commercial Pro Wrestling leagues, government stipend structures up to ₹12L - ₹30L/annum."
  },
  {
    id: "boxing",
    name: "Boxing",
    progression: [
      "School Boxing tournaments",
      "District amateur selections",
      "State Sub-Junior Boxing championships",
      "National Elite Boxing Championships trials",
      "SAI Boxing Centers / Army Sports Institute recruits",
      "National Elite Boxing Camp",
      "World Amateur Boxing Championships / Olympics",
      "Professional Boxing Leagues entry"
    ],
    selectionProcess: "Performance review during national boxing divisions and direct knockout trials hosted by Boxing Federation of India (BFI).",
    requiredSkills: ["Fast footwork & angles alignment", "Precise combinations (jab, hook, cross)", "Evasive head movement and guards", "Punch shock absorption"],
    fitnessStandards: "Outstanding hand speed, solid rotational core power, elite cardiovascular VO2 limit, and rapid reflex reactions.",
    trainingGuidance: "Daily 6 rounds of heavy bag work, 4 rounds of mitt punching, shadow boxing with head slipping, spar routines twice a week, 5km track runs.",
    careerOpportunities: ["Amateur Olympic Boxer", "Professional League Boxer", "Certified Cut-Man / Coach", "Tactical Advisor"],
    earningsPotential: "Stipends & PSU Jobs: ₹5L - ₹10L/annum, Professional fight purses: ₹2L to ₹50L+ per bout based on global rank tier."
  },
  {
    id: "cycling",
    name: "Cycling (Road / Track)",
    progression: [
      "Local cycling club open time-trials",
      "District Road Cycling championships",
      "State Cycling selection meets",
      "National Road / Track Cycling Championships",
      "SAI National Cycling Academy (NCA) selection",
      "Asian Cycling Confederation (ACC) tours",
      "UCI World Tour Team / Olympic trials"
    ],
    selectionProcess: "Meeting explicit stopwatch times in road time-trials and track pursuit events monitored by Cycling Federation of India (CFI).",
    requiredSkills: ["Pedal cadence management", "Slipstream draft tactics", "High speed cornering stability", "Aerodynamic body posture"],
    fitnessStandards: "Extreme leg quad power, immense aerobic threshold, high lactic acid exhaustion resistance (high power-to-weight ratio).",
    trainingGuidance: "300km road miles weekly, high-intensity cycling interval routines, core isometric endurance, leg leg-presses & squats.",
    careerOpportunities: ["Professional Tour Cyclist", "Team Director / Coach", "Aerodynamics advisor", "Elite Cycling mechanic"],
    earningsPotential: "Domestic: ₹2L - ₹6L/annum, Pro-Continental / WT Teams: €30,000 to €150,000+/annum."
  },
  {
    id: "golf",
    name: "Golf",
    progression: [
      "Junior Club Membership & Handicap index setup",
      "IGU (Indian Golf Union) Junior Tour (Zonal Feeders)",
      "IGU National Junior Tour (Category A, B, C, D)",
      "National Amateur Championship tournaments",
      "PGTI (Professional Golf Tour of India) Qualifying School",
      "PGTI Tour card holder",
      "Asian Tour / DP World Tour / PGA Tour qualifying stages"
    ],
    selectionProcess: "Maintaining strict low Handicap indices (<2 status) and securing placement ranks on the official IGU order of merit lists.",
    requiredSkills: ["High swing mechanics repeatability", "Perfect green reading accuracy", "Short game chip precision", "Psychological steady patience"],
    fitnessStandards: "Optimized rotational back core torque power, shoulder flexibility, wrist joint strength, and extreme walking stamina.",
    trainingGuidance: "Practice 200 range swings daily, 1 hour putting drills, core rotational exercises using medicine balls, and 18-hole practice rounds.",
    careerOpportunities: ["Touring Professional Golfer", "Class-A PGA club coach", "Resort Director of Golf", "Caddie Analyst Advisor"],
    earningsPotential: "PGTI prize earnings: ₹10L - ₹55L/annum, Asian/PGA professional tour stakes: $100,000 to $5 Million+ based on earnings cuts."
  },
  {
    id: "rugby",
    name: "Rugby",
    progression: [
      "School Rugby developmental clinics",
      "District/Metro Rugby Union trials",
      "State Rugby 7s/15s tournaments",
      "Rugby India Division 1/2 club leagues",
      "National Rugby Camps (SAI-funded)",
      "Asian Rugby Championship representational squad",
      "International World Rugby events"
    ],
    selectionProcess: "Open selection criteria focusing on speed-strength metrics, tackling efficiency, and overall game intelligence during domestic tournaments.",
    requiredSkills: ["Sprint tackling physics", "Precise backward passing accuracy", "Scrum leverage alignment", "Ruck/Maul positioning"],
    fitnessStandards: "High muscle mass, high impact speed endurance, extreme shoulder and neck strength to resist collision trauma.",
    trainingGuidance: "Heavy resistance training (bench press, squats, power cleans), tackling drills on pads, high-speed sprints with direction shifts.",
    careerOpportunities: ["Professional Rugby Club Player", "Rugby India Coach", "Fitness & Strength Conditioning Trainer"],
    earningsPotential: "Domestic: ₹1.5L - ₹4L/annum, International Tour Allowances; Private corporate leagues expand parameters."
  },
  {
    id: "baseball",
    name: "Baseball & Softball",
    progression: [
      "Inter-school baseball tournaments",
      "District Baseball selection trials",
      "State Level Baseball Meet (Sub-Junior / Major)",
      "National Baseball Championship (BFI Sanctioned)",
      "National selection training camps",
      "WBSC international tournaments / World Cups"
    ],
    selectionProcess: "Based on scouting indicators (pitching speed in MPH, batting average, fielding error index) at the National matches.",
    requiredSkills: ["Fast-pitch mechanics & curveballs", "Strategic batting plate vision", "Infield groundball glove transitions", "Outfield tracking & throw power"],
    fitnessStandards: "High rotational core agility, throwing arm shoulder stamina, and 30m base-running acceleration speed.",
    trainingGuidance: "Cage batting practice daily (100 balls), target pitching box completions, sprint intervals, shoulder cuff elasticity routines.",
    careerOpportunities: ["Professional Baseball Player", "Sports Hostels supervisor", "Baseball Trainer"],
    earningsPotential: "Domestic: ₹2L - ₹5L/annum, Overseas minor/major recruitment options based on exceptional metrics."
  },
  {
    id: "table_tennis_outdoor",
    name: "Table Tennis (Competitive Outdoor / Community)",
    progression: [
      "Community outdoor tables matches",
      "District amateur Table Tennis tournaments",
      "State TT ranking events",
      "National Table Tennis Championship (TTFI Sanctioned)",
      "Ultimate Table Tennis (UTT) league draft",
      "WTT Youth Series and international pro draws"
    ],
    selectionProcess: "Winning state, national ranking points to gain TTFI rank card. Competitive outdoor transitions to professional indoor tracks early.",
    requiredSkills: ["Multi-angle table spin control", "Extreme reaction speed reflex", "Fast counter-attacking counters", "Optimal paddle handling"],
    fitnessStandards: "Super-fast foot shuffles, high-speed hand-eye micro-coordination, and quick lunging core recovery.",
    trainingGuidance: "Multi-ball speed drills (80 balls/minute), hand reaction timers, physical fast-foot side-to-side shuffle boxes.",
    careerOpportunities: ["Professional UTT / International Athlete", "Club Head Coach", "Brand Ambassador"],
    earningsPotential: "UTT League Deals: ₹3L - ₹15L/season, International prize draws and central PSU job salaries."
  }
];

export const INDOOR_SPORTS: SportPathway[] = [
  {
    id: "chess",
    name: "Chess",
    progression: [
      "FIDE rated local school/academy open tournaments",
      "State Junior Chess Championships (u7, u9, u11, u13, u15, u17)",
      "National Junior & Senior Chess Championships (AICF Sanctioned)",
      "FIDE Rated Asian & World Youth Championships",
      "Achieving FIDE titles: Arena Master -> Candidate Master -> FIDE Master -> International Master (IM) -> Grandmaster (GM)",
      "Global Chess League (GCL) professional franchise select",
      "World Chess Candidates Tournament -> World Chess Championship Match"
    ],
    selectionProcess: "Based purely on the official Elo Rating system published monthly by FIDE. Scoring required standards (norms) at international events for Grandmaster titles.",
    requiredSkills: ["Deep calculation trees (15+ moves deep)", "Spatial pattern recognition", "Endgame matrix precision", "Psychological composure under time scarcity"],
    fitnessStandards: "High mental endurance (ability to sit concentrated for 6+ hours), low resting heart rate to handle stress, physical neck/back posture support.",
    trainingGuidance: "Daily 4 hours analyzing database games (Chessbase), practicing calculations on tactical puzzles, engine analysis, and physical aerobic cardio.",
    careerOpportunities: ["International Grandmaster", "Elite Personal Trainer / Second", "Chess Content Creator", "High-Performance Academic Director"],
    earningsPotential: "Global Tournament Prizes: $10,000 to $1.2 Million+, GCL Franchise Draft: $10,000 to $150,000+ per month, high-end private coaching."
  },
  {
    id: "carrom",
    name: "Carrom",
    progression: [
      "Local school / community board tournaments",
      "District Carrom championships",
      "State Level Championships (AICF Sanctioned)",
      "National Carrom Championship trials",
      "National Selection Trials for Indian Team",
      "ICF World Carrom Championships / Asian Carrom Cup"
    ],
    selectionProcess: "Performance tracking in national rank tournaments leading to selections overseen by the All India Carrom Federation.",
    requiredSkills: ["Precise visual pocketing angles", "Optimal thumb-finger striker control", "Rebound calculations", "Mental focus and finger positioning"],
    fitnessStandards: "Shoulder stability, wrist tendon strength, steady finger dexterity, and comfortable long sitting posture.",
    trainingGuidance: "3 hours of board board-shot repetitions daily, practicing difficult white-slams, follow-through mechanics, and wrist exercises.",
    careerOpportunities: ["International Carrom Player", "PSU Sports Quota Officer", "State Selector Coach"],
    earningsPotential: "PSU Employment (Job safety): ₹4L - ₹8L/annum, Tournament pricing: up to ₹50K to ₹5L for top national ranks."
  },
  {
    id: "table_tennis_indoor",
    name: "Table Tennis (Indoor Pro)",
    progression: [
      "District TTFI Rank tournaments",
      "State Table Tennis Championships",
      "Junior National TT events",
      "Senior National Table Tennis Championship",
      "Ultimate Table Tennis (UTT) Franchise draft",
      "WTT Feeder & Contender international circuit",
      "Olympic Table Tennis representative"
    ],
    selectionProcess: "Strictly regulated by Table Tennis Federation of India (TTFI) order of merit points, based on tournament performance.",
    requiredSkills: ["Intense spin recognition (Top, Back, Side)", "Rapid table counter-looping", "Aggressive serve strategies", "Rapid reaction times"],
    fitnessStandards: "Elite agility, exceptional footwork speed, stable wrist grip, and fast visual tracking capability.",
    trainingGuidance: "Robot multi-ball drilling, forehand loop to backhand block transition practices, core stability workouts, reaction time exercises.",
    careerOpportunities: ["International Athlete", "UTT Franchise Player", "TT Academy Tutor", "BCCI Sports Council Specialist"],
    earningsPotential: "UTT League Deals: ₹4L - ₹20L/season, PSU salary: ₹6L - ₹12L/annum, International ITTF prize pools."
  },
  {
    id: "snooker_billiards",
    name: "Snooker & Billiards",
    progression: [
      "Local billiard hall open tournaments",
      "State Billiards & Snooker championships",
      "National Billiards & Snooker Championship (BSFI Sanctioned)",
      "National Camp selection",
      "IBSF World Snooker / Billiards Championships",
      "WPBSA World Snooker Professional Tour card entry"
    ],
    selectionProcess: "BSFI national rank standings determine selections for international amateur representations, while Q-School opens the pro tour card.",
    requiredSkills: ["Flawless cue ball control", "Perfect cue alignment stance", "Tactical frame safety play", "Break building patterns"],
    fitnessStandards: "Isometric core stability, stable lower-body stance, leg hamstring flexibility, and long-term standing balance.",
    trainingGuidance: "Cue ball pathing practice drills, safety-pots, straight-line cueing for 1 hour, mental visualization, 100-break trials.",
    careerOpportunities: ["Professional World Tour Player", "Billiards Academy Director", "Accredited Coach", "Exhibition Athlete"],
    earningsPotential: "Domestic: ₹3L - ₹10L/annum, Professional World Snooker Tour Prize Money: £20,000 to £500,000+ for ranking titles."
  },
  {
    id: "indoor_athletics",
    name: "Indoor Athletics",
    progression: [
      "State indoor track trials",
      "National Indoor Track & Field Competitions",
      "Asian Indoor Athletics Championships",
      "World Athletics Indoor Championships",
      "Olympic Track & Field qualifiers"
    ],
    selectionProcess: "Performance stopwatch times and height/distance markers achieved in certified national indoor arenas overseen by AFI.",
    requiredSkills: ["Steep curve banking sprits", "Rapid sprint block starts", "Optimal pacing (for indoor 800m/1500m)", "High leap landing mechanics"],
    fitnessStandards: "High explosive leg power, peak sprinting velocity in restricted spaces, and outstanding core leg power.",
    trainingGuidance: "Short-track sprint workouts, plyometric bounding jumps, dynamic explosive weight squats, pacing control on banked tracks.",
    careerOpportunities: ["Professional Athlete", "Athletic Club Guide", "Speed Performance advisor"],
    earningsPotential: "Stipends & sponsorships: ₹3L - ₹15L/annum, international podium incentives up to ₹50L+."
  },
  {
    id: "badminton",
    name: "Badminton",
    progression: [
      "District Badminton Association rankings",
      "State Ranking Badminton Tournaments (BAI Sanctioned)",
      "Sub-Junior & Junior National Badminton Championships",
      "National Elite Academies scouting (Gopichand / Padukone LNJ)",
      "BAI National Selection Trials",
      "BWF World Tour Tournaments (Super 100, 300, 500, 750, 1000)",
      "Indian National Core Team (Thomas Cup / Olympics)"
    ],
    selectionProcess: "Based on active national ranking points tables compiled by Badminton Association of India and performance audits in National selection matches.",
    requiredSkills: ["High-speed smash execution", "Steep drop shot accuracy", "Deceptive wrist movements", "Rapid defensive court court-coverage"],
    fitnessStandards: "Elite-level cardiovascular stamina, extreme leg court shuffle lunges, rapid side-jumps, stable back torque, and high reflexes.",
    trainingGuidance: "On-court multi-shuttle drilling (120 shuttles/run), sprint suicides, wrist exercises with weighted racquets, core rotational stability.",
    careerOpportunities: ["International professional BWF player", "BAI Academy Director", "Personal Performance Supervisor", "Corporate League Organizer"],
    earningsPotential: "BWF World Tour: $15,000 to $1.5 Million+ in prize pools, Premier League Deals: ₹10L - ₹80L/season, Tier-1 endorsements."
  },
  {
    id: "squash",
    name: "Squash",
    progression: [
      "Local club squash tournaments",
      "SRFI (Squash Rackets Federation of India) Junior National Circuit",
      "National Squash Championships",
      "PSA (Professional Squash Association) World Tour satellite events",
      "PSA Challenger & World Tour Series",
      "Asian Games / Commonwealth Games representation"
    ],
    selectionProcess: "Earning ranking points in SRFI junior and senior tournaments leading to qualification for national camps and PSA entry cards.",
    requiredSkills: ["Unmatched wall rebound prediction", "High wrist snap shot control", "Intense court-center T occupancy tactics", "Lunging shot recovery"],
    fitnessStandards: "Arguably the highest endurance-agility sport; requirements include extreme VO2 levels, multi-directional lunging, leg power.",
    trainingGuidance: "Continuous solo court wall hitting (300 reps), ghosting footwork exercises on court (100 sets), long-distance cardio, split-leg speed shuffles.",
    careerOpportunities: ["PSA Tour Professional", "Resort Elite Squash Consultant", "Country Club Head Coach"],
    earningsPotential: "PSA World Tour Prizes: $5,000 to $250,050+ depending on draw status. Elite club coaches earn high salaries: ₹10L - ₹25L/annum."
  }
];

export const ESPORTS: SportPathway[] = [
  {
    id: "bgmi",
    name: "Battlegrounds Mobile India (BGMI)",
    progression: [
      "Local/College Campus Cup tournaments",
      "Open-to-all Community scrims & daily custom rooms",
      "Official In-Game Qualifiers (BGIS/BMPS)",
      "Online Stage Qualifiers & Semi-Finals",
      "LAN Grand Finals representing a top-tier esports organization",
      "National Champions & International Invitationals representation"
    ],
    hardwareRequirements: "High refresh-rate modern smartphone (minimum 90fps display, Apple iPad Pro or ASUS ROG series, ultra-low ping networks).",
    requiredSkills: ["Millimetric recoil spray tracking", "Split-second zone rotational planning", "High-stress close-combat aim", "Consistent communication under pressure"],
    fitnessStandards: "Excellent reflex hand-eye muscle speed, mental resilience, and shoulder/arm core stability.",
    practicePlans: "6 hours daily divided into: 1 hour aim training (Drill maps), 3 hours competitive Tier-1 player scrims, 2 hours map feedback and macro planning.",
    tournamentStructure: "Multi-stage. In-game qualifiers, online league phases, high-stake LAN multi-day stadium tournaments managed by Krafton / NODWIN.",
    teamSelection: "Recruitment by pro-org scouts based on average damage, finish-per-match (FPM) ratios, scrim stats, and team synergy roles (IGL, Assaulter, Support).",
    careerOpportunities: ["Professional Esports Athlete (Signed under Salary)", "Team In-Game Leader (IGL)", "Esports Analyst & Coach", "Live Gaming Creator"],
    earningsPotential: "Orgs base salary: ₹50K to ₹3.5L/month, tournament prize money: teams share prize pools up to ₹2 Crore - ₹5 Crore per national tournament."
  },
  {
    id: "free_fire",
    name: "Garena Free Fire",
    progression: [
      "Guild tournaments & custom matches",
      "National FF Championship (FFIC) Qualifiers",
      "Pro League regional leagues",
      "Top-tier organization player contract signing",
      "Free Fire World Series (FFWS) international stage"
    ],
    hardwareRequirements: "iPad or premium Android gaming mobile devices configured at maximized responsive touch frames and low-ping routing.",
    requiredSkills: ["Speed gloo-wall placements", "Headshot reflex targeting", "Close-range rush strategies", "Fast-loot prioritization"],
    fitnessStandards: "Finger muscular stamina, high-acceleration reflex triggers, and stress composure.",
    practicePlans: "5 hours daily: 1 hour aim maps, 3 hours custom team guild scrims, 1 hour strategy review.",
    tournamentStructure: "Garena official championships, leading to grand global LAN championships hosted globally.",
    teamSelection: "Recruitments based on statistics in tournament stages, character combination utility layouts, leadership profiles.",
    careerOpportunities: ["Esports Athlete", "Gaming Influencer", "Guild Leader / Analyst", "Brand Ambassador"],
    earningsPotential: "Team Salary: ₹25K - ₹1.5L/month, global tournament prizes reaching millions of dollars globally."
  },
  {
    id: "valorant",
    name: "Valorant (PC)",
    progression: [
      "Ranked Matchmaking (Ascendant -> Immortal -> Radiant)",
      "Local LAN cups & amateur team competitions",
      "Challengers Leagues (VCL South Asia)",
      "Scouted to Tier-1 VCT Franchise Organizations (e.g. Global Esports, Paper Rex)",
      "VCT Pacific International Franchise Leagues LAN",
      "VCT Masters & VCT Champions (Global Tier-1 LANs)"
    ],
    hardwareRequirements: "Gaming PC: Intel i7/Ryzen 7, 240Hz/360Hz refresh monitor, NVIDIA RTX GPU, precise ultra-light gaming mouse (e.g., Logitech 502 Superlight).",
    requiredSkills: ["Instant crosshair placement", "Strategic team utility lineups", "Clutch round analytical logic", "Fast mechanical flick aim"],
    fitnessStandards: "wrist ergonomic conditioning to prevent Carpal Tunnel, core spine posture support, high-frequency visual frame tracking.",
    practicePlans: "7 hours daily: 1 hour Aimlabs routines, 4 hours set scrim tactics with pro-coaches, 2 hours ranked matchmaking/VOD analysis.",
    tournamentStructure: "Riot Games official pathways: Open Qualifiers, Challengers League, International league stages, major and global Masters events.",
    teamSelection: "Signed by professional agencies analyzing Radiant leaderboards, scrim data, agent pool flexibility, and role fitment (Duelist, Initiator, Sentinel, Controller).",
    careerOpportunities: ["VCT Athlete", "Professional Esports Coach", "Agent Lineups theorist", "Tactical Analyst", "Broadcasting Caster"],
    earningsPotential: "Challengers Player: ₹30K - ₹1L/month, VCT International Franchise signed salary: $5,000 to $20,000+/month, apart from prize splits."
  },
  {
    id: "cs2",
    name: "Counter-Strike 2 (CS2)",
    progression: [
      "Platform matchmaking (FACEIT Levels 1-10 -> Challenger)",
      "Amateur open divisions (ESEA Open)",
      "Regional Challengers Leagues (Skyesports / ESL India)",
      "National representative teams signing",
      "Asia-Pacific RMR (Regional Major Rankings) qualifiers",
      "CS2 Valve Major Championship LAN"
    ],
    hardwareRequirements: "High performance PC maintaining 300+ FPS, high polling-rate mouse, custom mechanical gaming keyboards.",
    requiredSkills: ["Strategic grenade/smoke placement maps", "Recoil pattern muscle memory", "Econ management logic", "Precision crosshair placement"],
    fitnessStandards: "Excellent arm muscle endurance, wrist posture safety, reaction speed threshold (<150ms).",
    practicePlans: "8 hours daily: 2 hours aim practice (Aim_botz, deathmatch), 4 hours team scrims with tactical coaches, 2 hours game demos review.",
    tournamentStructure: "ESL Pro Tour, Valve World Majors, Skyesports National LANs, BLAST Premier tournaments.",
    teamSelection: "Performance index monitoring on FACEIT/HLTV profiles, leadership abilities, and trade-frag setups.",
    careerOpportunities: ["CS2 Pro Athlete", "Team Manager", "Tactics Analyst Coach", "Tournament Admin"],
    earningsPotential: "Regional Pro: ₹40K - ₹2L/month, International Tier-1 signed Athlete: $8,000 to $40,000+/month."
  },
  {
    id: "fifa",
    name: "FIFA & FC Pro (Console/PC)",
    progression: [
      "FUT Champions weekend leagues (Rank 1 status)",
      "EA Sports FC Pro Qualifiers regional events",
      "National Elite e-ISL representative draft",
      "e-ISL Club Esports player contract",
      "FC Pro World Championship finals"
    ],
    hardwareRequirements: "PlayStation 5 Console, low-latency monitor, pro controller, ultra-stable ethernet connection.",
    requiredSkills: ["Rapid custom formation adjustments", "Skill moves execution timing", "Defensive player-switching accuracy", "Dynamic counter attack layout"],
    fitnessStandards: "Outstanding hand-finger muscle endurance, high-frequency visual tracking, calm mental posture during clutch moments.",
    practicePlans: "4 hours daily: FUT champions matches, customized situational penalty/skill routines, analyzing games of global pro templates.",
    tournamentStructure: "EA Sports FC Pro sanctioned regional qualifiers leading to global LAN playoffs and World finals.",
    teamSelection: "Draft selections by real-world football club esports wings (Mumbai City FC, Kerala Blasters Esports) based on FC Pro points.",
    careerOpportunities: ["Esports Athlete", "Club Coach", "FIFA Streamer Creator", "Tournament referee"],
    earningsPotential: "e-ISL contracts: ₹30K - ₹1.5L/month, EA Pro prize pools up to $300,000 for top placements."
  },
  {
    id: "e_football",
    name: "e-Football Mobile & Console",
    progression: [
      "In-game championship ranks",
      "Regional community events",
      "National qualifiers (PES India / AIFF esports)",
      "Representing India in Asian e-Football cups",
      "World finals tournaments"
    ],
    hardwareRequirements: "High-spec mobile phone or PlayStation 5 console.",
    requiredSkills: ["Team play pass accuracy", "Precision sliding tackles", "Direct set-piece goals accuracy"],
    fitnessStandards: "Thumb dexterity, reaction speed mechanics, positional focus.",
    practicePlans: "4 hours daily: playing top-ranked ladder players, set-piece drills.",
    tournamentStructure: "Konami sanctioned official cups, high-tier representative federations leagues.",
    teamSelection: "Based on online match ratings, local championship wins, AIFF e-sports roster selection trails.",
    careerOpportunities: ["Pro Athlete", "Content Analyst"],
    earningsPotential: "₹20K - ₹1.2L/month based on placement and org sponsorships."
  },
  {
    id: "codm",
    name: "Call of Duty Mobile (CODM)",
    progression: [
      "Ranked multiplayer legend roster standings",
      "Community skirmish cups",
      "CODM World Championship Stage 1-4 Qualifiers",
      "Signed by pro organizations (e.g., GodLike, Vitality)",
      "CODM World Championship Grand LAN Finals"
    ],
    hardwareRequirements: "High refresh-rate gaming mobile, gaming triggers (where allowed), iPad Pro configurations.",
    requiredSkills: ["Advanced sliding & movement controls", "Fast scoping response aim", "Map spawns tracking and logic", "Objective-oriented positioning"],
    fitnessStandards: "High visual speed tracking, motor cortex response conditioning, postural stability.",
    practicePlans: "6 hours daily: 1 hour reflex maps, 3 hours custom Tier-1 scrims, 2 hours VOD reviews.",
    tournamentStructure: "Activision CODM Championship stages leading to worldwide massive LAN tournaments.",
    teamSelection: "Orgs scouting based on slayer/objective kills, team roles (Slayer, Anchor, OBJ), tourney highlights.",
    careerOpportunities: ["Pro CODM Athlete", "Gaming Creator", "Team Analyst Coach"],
    earningsPotential: "Signed base salary: ₹40K - ₹2.5L/month, global prize championships pool of $1 Million+."
  },
  {
    id: "clash_royale",
    name: "Clash Royale",
    progression: [
      "Top-ladder finishes in Trophy Road & Path of Legends",
      "Amateur online tournaments",
      "Clash Royale League (CRL) monthly qualifiers",
      "CRL Monthly Finals",
      "Signed by Esports organizations",
      "Clash Royale League World Finals"
    ],
    hardwareRequirements: "Standard tablet or rapid touch latency iPad / mobile phone.",
    requiredSkills: ["Opponent card cycle tracking", "Optimal deck building counter setups", "Elixir-count estimation math", "Micro-second tile placement accuracy"],
    fitnessStandards: "Calm mental pressure resistance, long-term focus retention.",
    practicePlans: "5 hours daily: 2 hours playing grand challenge tournaments, 20 card deck strategy trials, 2 hours micro-game situational VOD reviews.",
    tournamentStructure: "Supercell CRL Monthly stages leading to global finals.",
    teamSelection: "Performance on CRL points tables, active trophy counts, card pool mastery, deck creativity.",
    careerOpportunities: ["Pro CRL Athlete", "Deck composition strategist", "Esports analyst"],
    earningsPotential: "CRL Monthly wins, Team salary: ₹30K - ₹1.5L/month, World finals prizes."
  }
];
