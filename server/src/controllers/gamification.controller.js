import { Challenge } from '../models/Challenge.js';
import { Badge } from '../models/Badge.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { User } from '../models/User.js';

// Helper to seed default badges if empty
async function seedDefaultBadges() {
  const defaultBadges = [
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

  const count = await Badge.countDocuments();
  if (count === 0) {
    return await Badge.insertMany(defaultBadges);
  }
  return await Badge.find();
}

// Helper to seed default challenges if empty
async function seedDefaultChallenges() {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 3600000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 3600000);

  const defaultChallenges = [
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

  const count = await Challenge.countDocuments();
  if (count === 0) {
    return await Challenge.insertMany(defaultChallenges);
  }
  return await Challenge.find();
}

// Helper to seed student profiles for demonstration
async function ensureStudentProfilesSeeded(currentUser) {
  // Ensure current user has a student profile
  let myProfile = await StudentProfile.findOne({ user: currentUser._id });
  if (!myProfile) {
    const badges = await Badge.find();
    const myBadges = badges.slice(0, 2).map(b => b._id);
    
    myProfile = await StudentProfile.create({
      user: currentUser._id,
      points: 380,
      streak: 4,
      sustainabilityScore: 84,
      completedChallengesCount: 2,
      badges: myBadges
    });
  }

  // Create additional mock profiles for the student rankings leaderboard
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
        collegeName: currentUser.collegeName || 'Stanford University',
        role: 'viewer'
      });
    }

    const profileDoc = await StudentProfile.findOne({ user: userDoc._id });
    if (!profileDoc) {
      const allBadges = await Badge.find();
      const badgesSubset = allBadges.slice(0, 3).map(b => b._id);
      await StudentProfile.create({
        user: userDoc._id,
        points: mock.points,
        streak: mock.streak,
        sustainabilityScore: mock.score,
        completedChallengesCount: mock.completed,
        badges: badgesSubset
      });
    }
  }
}

export const getLeaderboard = async (req, res, next) => {
  try {
    // 1. Ensure we have seeded profiles first
    await seedDefaultBadges();
    await ensureStudentProfilesSeeded(req.user);

    // 2. Fetch student rankings (individual leaderboard)
    const studentRankings = await StudentProfile.find()
      .populate('user', 'adminName collegeName')
      .sort({ points: -1 })
      .lean();

    // Map ranks dynamically
    const formattedStudents = studentRankings.map((sp, idx) => ({
      _id: sp._id,
      name: sp.user?.adminName || 'Anonymous Student',
      campus: sp.user?.collegeName || 'Main Campus',
      points: sp.points,
      streak: sp.streak,
      sustainabilityScore: sp.sustainabilityScore,
      rank: idx + 1
    }));

    // 3. Department Rankings (aggregate or fallback)
    const departmentRankings = [
      { name: "School of Engineering", score: 94, points: 18200, rank: 1, trend: "up", change: "+2.4%" },
      { name: "School of Business", score: 88, points: 15400, rank: 2, trend: "up", change: "+1.1%" },
      { name: "Student Union", score: 82, points: 13900, rank: 3, trend: "neutral", change: "0.0%" },
      { name: "Arts & Sciences", score: 76, points: 11200, rank: 4, trend: "down", change: "-1.5%" },
      { name: "Athletics Complex", score: 65, points: 9800, rank: 5, trend: "down", change: "-4.2%" }
    ];

    res.status(200).json({
      success: true,
      data: {
        departments: departmentRankings,
        students: formattedStudents
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getChallenges = async (req, res, next) => {
  try {
    const challenges = await seedDefaultChallenges();
    
    // Fetch user profile to see which challenges are already joined
    const profile = await StudentProfile.findOne({ user: req.user._id });
    
    const formattedChallenges = challenges.map((c) => {
      const cObj = c.toObject();
      const joinedInfo = profile?.joinedChallenges.find(
        (jc) => jc.challenge.toString() === c._id.toString()
      );
      return {
        ...cObj,
        isJoined: !!joinedInfo,
        progress: joinedInfo ? joinedInfo.progress : 0,
        status: joinedInfo ? joinedInfo.status : 'not_joined'
      };
    });

    res.status(200).json({
      success: true,
      data: formattedChallenges
    });
  } catch (err) {
    next(err);
  }
};

export const createChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
};

export const joinChallenge = async (req, res, next) => {
  try {
    const challengeId = req.params.id;
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
    }

    // Check if already joined
    const alreadyJoined = profile.joinedChallenges.some(
      (jc) => jc.challenge.toString() === challengeId
    );

    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'Challenge already joined' });
    }

    // Join challenge
    profile.joinedChallenges.push({
      challenge: challengeId,
      progress: 10, // start with 10% progress
      status: 'active'
    });

    await profile.save();

    // Increment challenge participant count
    challenge.currentParticipants += 1;
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined campus challenge',
      data: {
        challengeId,
        isJoined: true,
        progress: 10
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getBadges = async (req, res, next) => {
  try {
    const badges = await seedDefaultBadges();
    const profile = await StudentProfile.findOne({ user: req.user._id });
    
    const unlockedBadgeIds = profile?.badges.map(id => id.toString()) || [];

    const formattedBadges = badges.map((b) => {
      const bObj = b.toObject();
      return {
        ...bObj,
        isUnlocked: unlockedBadgeIds.includes(b._id.toString())
      };
    });

    res.status(200).json({
      success: true,
      data: {
        badges: formattedBadges,
        points: profile?.points || 0,
        streak: profile?.streak || 0,
        completedCount: profile?.completedChallengesCount || 0,
        sustainabilityScore: profile?.sustainabilityScore || 0
      }
    });
  } catch (err) {
    next(err);
  }
};
