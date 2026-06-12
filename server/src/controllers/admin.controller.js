import { Resource } from '../models/Resource.js';
import { Prediction } from '../models/Prediction.js';
import { Report } from '../models/Report.js';
import { Alert } from '../models/Alert.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Challenge } from '../models/Challenge.js';
import { Badge } from '../models/Badge.js';
import { Conversation } from '../models/Conversation.js';
import { Building } from '../models/Building.js';
import { User } from '../models/User.js';

/**
 * @desc    Reset all demo/generated database records
 * @route   DELETE /api/admin/reset-demo-data
 * @access  Private
 */
export const resetDemoData = async (req, res, next) => {
  try {
    await Promise.all([
      Resource.deleteMany({}),
      Prediction.deleteMany({}),
      Report.deleteMany({}),
      Alert.deleteMany({}),
      StudentProfile.deleteMany({}),
      Challenge.deleteMany({}),
      Badge.deleteMany({}),
      Conversation.deleteMany({}),
      Building.deleteMany({}),
    ]);

    res.json({
      success: true,
      message: 'Clean demo environment successfully created. Preserved administrative accounts.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Seed realistic college demo data
 * @route   POST /api/admin/seed-demo-data
 * @access  Private
 */
export const seedDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    // 1. Wipe existing dynamic collections
    await Promise.all([
      Resource.deleteMany({}),
      Prediction.deleteMany({}),
      Report.deleteMany({}),
      Alert.deleteMany({}),
      StudentProfile.deleteMany({}),
      Challenge.deleteMany({}),
      Badge.deleteMany({}),
      Conversation.deleteMany({}),
      Building.deleteMany({}),
    ]);

    // Update user's collegeName to have a professional look if not set
    if (!user.collegeName || user.collegeName === 'Stanford University') {
      user.collegeName = 'Evergreen State University';
      await user.save({ validateBeforeSave: false });
    }

    // 2. Seed 7 buildings
    const buildingsToSeed = [
      { name: 'Main Academic Block', code: 'MAB', departments: ['Computer Science', 'Mathematics', 'Physics'], yearBuilt: 1988, floorArea: 15000, location: { latitude: 37.4275, longitude: -122.1697 }, createdBy: userId },
      { name: 'Science & Tech Hub', code: 'STH', departments: ['Chemistry', 'Biotechnology', 'Research Lab'], yearBuilt: 2012, floorArea: 18000, location: { latitude: 37.4282, longitude: -122.1685 }, createdBy: userId },
      { name: 'Student Union', code: 'STU', departments: ['Events & Culture', 'Canteen', 'Recreation'], yearBuilt: 2008, floorArea: 12000, location: { latitude: 37.4268, longitude: -122.1702 }, createdBy: userId },
      { name: 'Library Complex', code: 'LBC', departments: ['Digital Resources', 'Archives', 'Reading Halls'], yearBuilt: 1996, floorArea: 22000, location: { latitude: 37.4290, longitude: -122.1690 }, createdBy: userId },
      { name: 'Admin Building', code: 'ADB', departments: ['HR & Finance', 'Management', 'IT Services'], yearBuilt: 1978, floorArea: 8000, location: { latitude: 37.4255, longitude: -122.1710 }, createdBy: userId },
      { name: 'Sports Facility', code: 'SPF', departments: ['Athletics', 'Aquatics', 'Gymnasium'], yearBuilt: 2016, floorArea: 25000, location: { latitude: 37.4245, longitude: -122.1725 }, createdBy: userId },
      { name: 'Engineering Block', code: 'ENB', departments: ['Mechanical', 'Civil', 'Electrical'], yearBuilt: 2004, floorArea: 20000, location: { latitude: 37.4300, longitude: -122.1678 }, createdBy: userId },
    ];

    const seededBuildings = await Building.insertMany(buildingsToSeed);

    // 3. Seed 30 days of resource logs (electricity, water, waste)
    // We want a realistic weekly trend (weekdays higher, weekends lower) with some noise
    const resourceLogs = [];
    const baseUtilities = {
      'Main Academic Block': { elec: 400, water: 1500, waste: 40, depts: ['Computer Science', 'Mathematics', 'Physics'] },
      'Science & Tech Hub': { elec: 600, water: 2500, waste: 50, depts: ['Chemistry', 'Biotechnology', 'Research Lab'] },
      'Student Union': { elec: 250, water: 3000, waste: 120, depts: ['Events & Culture', 'Canteen', 'Recreation'] },
      'Library Complex': { elec: 450, water: 1000, waste: 15, depts: ['Digital Resources', 'Archives', 'Reading Halls'] },
      'Admin Building': { elec: 150, water: 800, waste: 20, depts: ['HR & Finance', 'Management', 'IT Services'] },
      'Sports Facility': { elec: 300, water: 4000, waste: 35, depts: ['Athletics', 'Aquatics', 'Gymnasium'] },
      'Engineering Block': { elec: 500, water: 1800, waste: 45, depts: ['Mechanical', 'Civil', 'Electrical'] },
    };

    for (let day = 30; day >= 1; day--) {
      const logDate = new Date();
      logDate.setDate(logDate.getDate() - day);
      const dayOfWeek = logDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Seed entries for each building
      for (const b of seededBuildings) {
        const base = baseUtilities[b.name];
        if (!base) continue;

        // Choose a department randomly
        const department = base.depts[Math.floor(Math.random() * base.depts.length)];

        // Calculate usage with multiplier
        const mult = isWeekend
          ? (0.35 + Math.random() * 0.1) // 35% to 45% on weekends
          : (0.85 + Math.random() * 0.3); // 85% to 115% on weekdays

        const electricity = parseFloat((base.elec * mult).toFixed(2));
        const water = parseFloat((base.water * mult).toFixed(2));
        const waste = parseFloat((base.waste * mult).toFixed(2));

        // Carbon calculated automatically on pre('save') but we can pre-set it to avoid issues
        const carbon = parseFloat((electricity * 0.233 + waste * 0.054).toFixed(4));

        resourceLogs.push({
          building: b.name,
          department,
          electricity,
          water,
          waste,
          carbon,
          date: logDate,
          enteredBy: userId,
          notes: 'Daily automatic smart meter reading log.',
        });
      }
    }

    await Resource.insertMany(resourceLogs);

    // 4. Seed Predictions
    const predictionsToSeed = [
      {
        resourceType: 'electricity',
        currentValue: 73500,
        predictedValue: 69825,
        pctChange: -5.0,
        confidence: 94,
        historicalValues: [71200, 72500, 70900, 73100, 72800, 73500],
        predictedTrend: [72100, 71500, 70800, 69825, 68900, 68100]
      },
      {
        resourceType: 'water',
        currentValue: 382000,
        predictedValue: 351440,
        pctChange: -8.0,
        confidence: 92,
        historicalValues: [395000, 391000, 388000, 392000, 385000, 382000],
        predictedTrend: [378000, 372000, 365000, 351440, 348000, 342000]
      },
      {
        resourceType: 'waste',
        currentValue: 6850,
        predictedValue: 6028,
        pctChange: -12.0,
        confidence: 90,
        historicalValues: [7100, 7050, 6980, 7200, 6900, 6850],
        predictedTrend: [6700, 6520, 6300, 6028, 5950, 5800]
      },
      {
        resourceType: 'carbon',
        currentValue: 17498,
        predictedValue: 16597,
        pctChange: -5.15,
        confidence: 93,
        historicalValues: [16972, 17267, 16896, 17419, 17332, 17498],
        predictedTrend: [17173, 17024, 16843, 16597, 16379, 16187]
      }
    ];

    await Prediction.insertMany(predictionsToSeed);

    // 5. Seed Alerts (Anomalies)
    const alertsToSeed = [
      {
        title: 'HVAC Chiller Efficiency Deficit in Science & Tech Hub',
        category: 'Energy',
        building: 'Science & Tech Hub',
        severity: 'Critical',
        status: 'Open',
        description: 'Smart meter log detected daily electricity usage of 1,240 kWh, which is 42% higher than the 30-day baseline average for this day of the week.',
        impact: 'Estimated excess carbon: +88.5 kg CO2e/day. Est. daily cost impact: +$142.',
        rootCause: {
          whatHappened: 'A sudden 42% surge in electricity consumption was detected at Science & Tech Hub.',
          whyFlagged: 'Smart system flagged this reading because it exceeded the building Z-Score threshold (Z-Score: 2.89).',
          potentialCause: 'Server room primary HVAC cooling loop compressor malfunction or air bypass dampers stuck open.',
          estimatedImpact: 'Excess consumption of ~370 kWh daily. Est. additional cost: $142/day.',
          recommendedAction: 'Dispatch maintenance technician to inspect cooling tower pump and server room temperature sensors.'
        },
        isRead: false,
        timestamp: new Date(Date.now() - 3600000 * 3) // 3 hours ago
      },
      {
        title: 'Restroom Flush Valve Leakage in Library Complex',
        category: 'Water',
        building: 'Library Complex',
        severity: 'Warning',
        status: 'Investigating',
        description: 'Sub-meter flow sensors logged continuous overnight water consumption of 4.2 Liters/minute, indicating a severe toilet flush valve leak.',
        impact: 'Wasting approximately 6,048 Liters of water per day if left unresolved.',
        rootCause: {
          whatHappened: 'Overnight flow tracking detected non-zero constant water usage between 1:00 AM and 5:00 AM.',
          whyFlagged: 'Normally, night flow in the Library Complex drops to zero.',
          potentialCause: 'A broken rubber gasket or faulty diaphragms in the second-floor restrooms.',
          estimatedImpact: 'Loss of 250 L/hour. Est. cost impact: $18.50/day.',
          recommendedAction: 'Audit second-floor restroom flushometer valves and replace worn gaskets.'
        },
        isRead: false,
        timestamp: new Date(Date.now() - 3600000 * 16) // 16 hours ago
      },
      {
        title: 'Zero Single-Use Plastic Program Milestone',
        category: 'Waste',
        building: 'Student Union',
        severity: 'Info',
        status: 'Resolved',
        description: 'Waste audit logged a drop in average weekly landfill refuse from 840 kg to 610 kg following the implementation of reusable food container discount schemes.',
        impact: 'Diverted 230 kg of plastic waste from landfills, resulting in +150 points for the Student Union team.',
        rootCause: {
          whatHappened: 'Weekly waste segregation report verified a significant reduction in single-use cup plastic trash.',
          whyFlagged: 'Landfill waste output fell below the monthly target threshold by 27.3%.',
          potentialCause: 'Successful distribution of 1,200 branded reusable steel flasks to students.',
          estimatedImpact: '230 kg landfill diversion. Est. carbon offset: 12.4 kg CO2e.',
          recommendedAction: 'Continue supporting Student Union discounts and expand reusable food containers to other dining halls.'
        },
        isRead: true,
        timestamp: new Date(Date.now() - 3600000 * 48) // 2 days ago
      }
    ];

    await Alert.insertMany(alertsToSeed);

    // 6. Seed Gamification default badges and challenges
    const badgesToSeed = [
      {
        title: 'Green Novice',
        description: 'Maintain a 3-day resource logging streak to build eco-habits.',
        icon: 'Zap',
        type: 'Streak',
        requirement: '3-day logging streak'
      },
      {
        title: 'Eco Champion',
        description: 'Successfully complete 5 campus sustainability challenges.',
        icon: 'Trophy',
        type: 'Milestone',
        requirement: 'Complete 5 challenges'
      },
      {
        title: 'Carbon Slayer',
        description: 'Help reduce building carbon footprint metrics by 15% or more.',
        icon: 'Wind',
        type: 'Milestone',
        requirement: 'Reduce carbon by 15%'
      },
      {
        title: 'Water Guardian',
        description: 'Identify and resolve an active campus water wastage anomaly.',
        icon: 'Droplet',
        type: 'Special',
        requirement: 'Verify restroom leak anomaly'
      },
      {
        title: 'Master Conservationist',
        description: 'Maintain a 10-day active participation streak across campus activities.',
        icon: 'Award',
        type: 'Streak',
        requirement: '10-day active streak'
      }
    ];

    const seededBadges = await Badge.insertMany(badgesToSeed);

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 3600000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 3600000);

    const challengesToSeed = [
      {
        title: 'LED Conversion Sprint',
        description: 'Switch common area lighting arrays to smart LEDs for energy conservation.',
        category: 'Energy',
        type: 'Weekly',
        pointsReward: 120,
        targetValue: 12,
        currentParticipants: 14,
        startDate: now,
        endDate: nextWeek
      },
      {
        title: 'Double-Sided Printing Drive',
        description: 'Set all department printer defaults to double-sided. Zero paper wastage.',
        category: 'Waste',
        type: 'Weekly',
        pointsReward: 80,
        targetValue: 20,
        currentParticipants: 35,
        startDate: now,
        endDate: nextWeek
      },
      {
        title: 'Restroom Leak Hunting Campaign',
        description: 'Report faucet and flush valve leakage anomalies in Science Block restrooms.',
        category: 'Water',
        type: 'Monthly',
        pointsReward: 250,
        targetValue: 5,
        currentParticipants: 82,
        startDate: now,
        endDate: nextMonth
      },
      {
        title: 'Campus Net-Zero Decathlon',
        description: 'Achieve a 15% carbon footprint reduction across dormitory residences.',
        category: 'Carbon',
        type: 'Campus',
        pointsReward: 500,
        targetValue: 15,
        currentParticipants: 145,
        startDate: now,
        endDate: nextMonth
      },
      {
        title: 'Zero Single-Use Plastic Mandate',
        description: 'Commit to using exclusively reusable cups and flasks inside the Student Union.',
        category: 'Waste',
        type: 'Weekly',
        pointsReward: 150,
        targetValue: 100,
        currentParticipants: 114,
        startDate: now,
        endDate: nextWeek
      }
    ];

    const seededChallenges = await Challenge.insertMany(challengesToSeed);

    // 7. Seed current user's Student Profile
    // Unlock first 3 badges, and join 2 challenges
    const myBadges = seededBadges.slice(0, 3).map(b => b._id);
    const myJoinedChallenges = [
      {
        challenge: seededChallenges[0]._id, // LED Conversion Sprint
        progress: 60,
        status: 'active',
        joinedAt: new Date(Date.now() - 2 * 24 * 3600000)
      },
      {
        challenge: seededChallenges[2]._id, // Restroom Leak Hunting Campaign
        progress: 20,
        status: 'active',
        joinedAt: new Date(Date.now() - 4 * 24 * 3600000)
      }
    ];

    await StudentProfile.create({
      user: userId,
      points: 420,
      streak: 5,
      sustainabilityScore: 86,
      completedChallengesCount: 3,
      badges: myBadges,
      joinedChallenges: myJoinedChallenges
    });

    // 8. Create or seed competitive mock students on the leaderboard
    const mockStudents = [
      { name: 'Sophia Martinez', email: 'sophia@university.edu', points: 890, streak: 9, score: 92, completed: 6 },
      { name: 'Liam Johnson', email: 'liam@university.edu', points: 740, streak: 6, score: 88, completed: 4 },
      { name: 'Olivia Davis', email: 'olivia@university.edu', points: 610, streak: 5, score: 85, completed: 3 }
    ];

    for (const mock of mockStudents) {
      let userDoc = await User.findOne({ email: mock.email });
      if (!userDoc) {
        userDoc = await User.create({
          adminName: mock.name,
          email: mock.email,
          password: 'password123',
          collegeName: user.collegeName,
          role: 'viewer'
        });
      } else {
        userDoc.collegeName = user.collegeName;
        await userDoc.save({ validateBeforeSave: false });
      }

      await StudentProfile.findOneAndUpdate(
        { user: userDoc._id },
        {
          user: userDoc._id,
          points: mock.points,
          streak: mock.streak,
          sustainabilityScore: mock.score,
          completedChallengesCount: mock.completed,
          badges: myBadges // give them the same badges
        },
        { upsert: true, new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Demo college dataset loaded successfully! Evergreen State University is active.',
    });
  } catch (err) {
    next(err);
  }
};
