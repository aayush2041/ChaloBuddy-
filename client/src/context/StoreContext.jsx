import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_TRIPS,
  INITIAL_STAYS,
  INITIAL_BUDDIES,
  INITIAL_STORIES,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  MOCK_MANALI_PLAN,
} from '../data/seedData';
import { generateTripPlan } from '../services/tripPlannerService';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  // 1. Current User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_user');
      return saved ? JSON.parse(saved) : INITIAL_USERS[1]; // Default: Priya Patel (Traveler)
    } catch {
      return INITIAL_USERS[1];
    }
  });

  // 2. Navigation State / Hash Routing
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return { page: 'home', params: {} };
    const parts = hash.split('/');
    const page = parts[0] || 'home';
    const id = parts[1] || '';
    return { page, params: { id, tab: parts[1] || '' } };
  });

  // 3. Currency State
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('cb_currency') || 'INR';
  });

  const currencyRates = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 0.012 },
    EUR: { symbol: '€', rate: 0.011 },
  };

  const formatPrice = (inrAmount) => {
    const config = currencyRates[currency] || currencyRates.INR;
    const converted = Math.round(Number(inrAmount) * config.rate);
    return `${config.symbol}${converted.toLocaleString('en-IN')}`;
  };

  // 4. Trips Catalog & User Listed Trips
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_trips');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length < INITIAL_TRIPS.length) return INITIAL_TRIPS;
        return parsed;
      }
      return INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  // 5. Stays Catalog
  const [stays, setStays] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_stays');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length < INITIAL_STAYS.length || !parsed[0]?.lat) {
          return INITIAL_STAYS;
        }
        return parsed;
      }
      return INITIAL_STAYS;
    } catch {
      return INITIAL_STAYS;
    }
  });

  // 6. Travel Buddies Catalog
  const [buddies, setBuddies] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_buddies');
      return saved ? JSON.parse(saved) : INITIAL_BUDDIES;
    } catch {
      return INITIAL_BUDDIES;
    }
  });

  // 7. Saved Items (Trips, Stays, Buddies)
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_saved_trips');
      return saved ? JSON.parse(saved) : ['trip-spiti-valley', 'trip-kasol-tirthan'];
    } catch {
      return ['trip-spiti-valley', 'trip-kasol-tirthan'];
    }
  });

  const [savedStays, setSavedStays] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_saved_stays');
      return saved ? JSON.parse(saved) : ['stay-himalayan-stay'];
    } catch {
      return ['stay-himalayan-stay'];
    }
  });

  const [savedBuddies, setSavedBuddies] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_saved_buddies');
      return saved ? JSON.parse(saved) : ['bdy_aarav'];
    } catch {
      return ['bdy_aarav'];
    }
  });

  // 8. My Trips (Upcoming, Ongoing, Past) with Trip Workspace
  const [myTrips, setMyTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_my_trips');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        bookingId: 'BK-78912',
        tripId: 'trip-kasol-tirthan',
        tripTitle: 'Kasol & Tirthan Getaway',
        destination: 'Parvati Valley, Himachal Pradesh',
        status: 'upcoming',
        dates: '10–13 Nov, 2025',
        startDate: '2025-11-10',
        travelers: 2,
        totalPaid: 16998,
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
        organizer: 'Aarav Sharma',
        meetingPoint: 'Kashmere Gate Metro, Delhi (07:00 PM)',
        transportInfo: 'AC Volvo Coach DL-01-TR-4921 (Seat 14, 15)',
        stayInfo: 'Riverside Wooden Chalets, Kasol & Tirthan',
        budgetTracker: {
          target: 20000,
          spent: 16998,
          expenses: [
            { id: 'exp1', item: 'Trip Booking Package (2 Pax)', amount: 16998, category: 'Package' },
            { id: 'exp2', item: 'Warm Gloves & Thermals', amount: 1450, category: 'Gear' },
          ],
        },
        packingChecklist: [
          { id: 'chk1', text: 'Valid Govt Photo ID (Aadhar/Passport)', done: true },
          { id: 'chk2', text: 'Fleece jacket & waterproof windcheater', done: true },
          { id: 'chk3', text: 'Power bank (20,000 mAh)', done: false },
          { id: 'chk4', text: 'Trekking shoes with solid grip', done: true },
          { id: 'chk5', text: 'Personal basic medicines & Diamox', done: false },
        ],
      },
      {
        bookingId: 'BK-54021',
        tripId: 'trip-manali-weekend',
        tripTitle: 'Manali Alpine Retreat',
        destination: 'Manali, Himachal Pradesh',
        status: 'ongoing',
        dates: 'Today – 28 Oct, 2025',
        startDate: '2025-10-24',
        travelers: 1,
        totalPaid: 9250,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        organizer: 'Aarav Sharma',
        meetingPoint: 'Majnu Ka Tilla, Delhi',
        transportInfo: 'Volvo Himachal Roadways Gold Class',
        stayInfo: 'The Himalayan Stay, Old Manali',
        budgetTracker: {
          target: 12000,
          spent: 9250,
          expenses: [{ id: 'exp_m1', item: 'Trip Package', amount: 9250, category: 'Package' }],
        },
        packingChecklist: [
          { id: 'chk_m1', text: 'Sunscreen & UV sunglasses', done: true },
          { id: 'chk_m2', text: 'Thermal water bottle', done: true },
        ],
      },
      {
        bookingId: 'BK-33981',
        tripId: 'trip-goa-escape',
        tripTitle: 'Goa Beach Escape',
        destination: 'North & South Goa',
        status: 'past',
        dates: '12–17 Mar, 2025',
        startDate: '2025-03-12',
        travelers: 2,
        totalPaid: 19998,
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        organizer: 'Rohan Verma',
        meetingPoint: 'Dabolim Airport',
        transportInfo: 'Private AC Mini-coach & Scooters',
        stayInfo: 'Boutique Villa with Private Pool, Vagator',
        budgetTracker: { target: 25000, spent: 23400, expenses: [] },
        packingChecklist: [],
      },
    ];
  });

  // 9. Stay Reservations
  const [stayBookings, setStayBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_stay_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 10. Conversations & Messages
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_conversations');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });
  const [activeConvId, setActiveConvId] = useState('conv-manali-group');

  // 11. Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // 12. Stories & Community
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_stories');
      return saved ? JSON.parse(saved) : INITIAL_STORIES;
    } catch {
      return INITIAL_STORIES;
    }
  });

  // 13. Smart Trip Planner State
  const [smartPlan, setSmartPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_smart_plan');
      return saved ? JSON.parse(saved) : MOCK_MANALI_PLAN;
    } catch {
      return MOCK_MANALI_PLAN;
    }
  });

  // Selected Structured Location for Autocomplete & Maps
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_selected_location');
      return saved ? JSON.parse(saved) : {
        id: 'delhi',
        city: 'Delhi',
        state: 'NCT of Delhi',
        country: 'India',
        fullName: 'Delhi, NCT of Delhi, India',
        type: 'Metropolis & Heritage Capital',
        lat: 28.6139,
        lng: 77.2090,
      };
    } catch {
      return null;
    }
  });

  // 14. Toasts & Alerts
  const [toasts, setToasts] = useState([]);

  // 15. Global Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [joinTripModalData, setJoinTripModalData] = useState(null);
  const [reserveStayModalData, setReserveStayModalData] = useState(null);
  const [videoTourModalOpen, setVideoTourModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState(null);
  const [writeStoryModalOpen, setWriteStoryModalOpen] = useState(false);
  const [writeReviewModalData, setWriteReviewModalData] = useState(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('cb_user', JSON.stringify(currentUser));
    else localStorage.removeItem('cb_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cb_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('cb_stays', JSON.stringify(stays));
  }, [stays]);

  useEffect(() => {
    localStorage.setItem('cb_buddies', JSON.stringify(buddies));
  }, [buddies]);

  useEffect(() => {
    localStorage.setItem('cb_saved_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  useEffect(() => {
    localStorage.setItem('cb_saved_stays', JSON.stringify(savedStays));
  }, [savedStays]);

  useEffect(() => {
    localStorage.setItem('cb_saved_buddies', JSON.stringify(savedBuddies));
  }, [savedBuddies]);

  useEffect(() => {
    localStorage.setItem('cb_my_trips', JSON.stringify(myTrips));
  }, [myTrips]);

  useEffect(() => {
    localStorage.setItem('cb_stay_bookings', JSON.stringify(stayBookings));
  }, [stayBookings]);

  useEffect(() => {
    localStorage.setItem('cb_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('cb_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cb_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    try {
      if (smartPlan) {
        localStorage.setItem('cb_smart_plan', JSON.stringify(smartPlan));
      }
    } catch (err) {
      console.warn('Failed to serialize cb_smart_plan:', err);
    }
  }, [smartPlan]);

  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('cb_selected_location', JSON.stringify(selectedLocation));
    }
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem('cb_currency', currency);
  }, [currency]);

  // Toast Helpers
  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigation Helper with deep link pushState
  const navigate = (page, params = {}) => {
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hashUrl = `#/${page}`;
    if (page === 'trip-detail' && params.id) {
      hashUrl = `#/trips/${params.id}`;
    } else if (page === 'stay-detail' && params.id) {
      hashUrl = `#/stays/${params.id}`;
    } else if (page === 'profile' && params.id) {
      hashUrl = `#/profile/${params.id}`;
    } else if (page === 'my-trips' && params.tab) {
      hashUrl = `#/my-trips/${params.tab}`;
    }
    window.history.pushState(null, '', hashUrl);
  };

  // Auth Operations & User Switching
  const switchUser = (userOrId) => {
    const targetUser = typeof userOrId === 'string'
      ? INITIAL_USERS.find((u) => u.id === userOrId) || INITIAL_USERS[0]
      : userOrId;
    setCurrentUser(targetUser);
    addToast(`Switched active profile to ${targetUser.name}`, 'info');
  };

  const loginUser = (email, password) => {
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'traveler',
      verified: true,
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      tripsHosted: 0,
      tripsCompleted: 1,
      location: 'India',
      bio: 'Enthusiastic explorer ready for mountain sunsets.',
      travelStyle: ['Adventure', 'Relaxed'],
      interests: ['Trekking', 'Campfires'],
      languages: ['English', 'Hindi'],
    };
    setCurrentUser(matched);
    setAuthModalOpen(false);
    addToast(`Welcome back, ${matched.name}!`, 'success');
  };

  const logoutUser = () => {
    setCurrentUser(null);
    addToast('Signed out of ChaloBuddy', 'info');
  };

  // Saved Items Operations
  const toggleSaveTrip = (tripId) => {
    setSavedTrips((prev) => {
      const exists = prev.includes(tripId);
      if (exists) {
        addToast('Trip removed from your Saved collection', 'info');
        return prev.filter((id) => id !== tripId);
      } else {
        addToast('Trip saved! View it anytime in Saved Trips', 'success');
        return [...prev, tripId];
      }
    });
  };

  const toggleSaveStay = (stayId) => {
    setSavedStays((prev) => {
      const exists = prev.includes(stayId);
      if (exists) {
        addToast('Stay removed from Saved Stays', 'info');
        return prev.filter((id) => id !== stayId);
      } else {
        addToast('Stay saved to your wishlist!', 'success');
        return [...prev, stayId];
      }
    });
  };

  const toggleSaveBuddy = (buddyId) => {
    setSavedBuddies((prev) => {
      const exists = prev.includes(buddyId);
      if (exists) {
        addToast('Buddy removed from Saved', 'info');
        return prev.filter((id) => id !== buddyId);
      } else {
        addToast('Buddy saved to your travel network!', 'success');
        return [...prev, buddyId];
      }
    });
  };

  const isTripSaved = (tripId) => savedTrips.includes(tripId);
  const isStaySaved = (stayId) => savedStays.includes(stayId);
  const isBuddySaved = (buddyId) => savedBuddies.includes(buddyId);

  // Buddy Connect Operation
  const toggleBuddyConnect = (buddyId) => {
    setBuddies((prev) =>
      prev.map((bdy) => {
        if (bdy.id === buddyId) {
          const nextState = !bdy.connected;
          if (nextState) {
            addToast(`Buddy connection request sent to ${bdy.name}! 🤝`, 'success');
          } else {
            addToast(`Disconnected from ${bdy.name}`, 'info');
          }
          return { ...bdy, connected: nextState };
        }
        return bdy;
      })
    );
  };

  // Trip Joining Operation (Section 10)
  const joinTrip = (tripId, requestData) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const travelersCount = Number(requestData.travelersCount || 1);
    const bookingId = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalAmount = targetTrip.price * travelersCount;

    const newBooking = {
      bookingId,
      tripId: targetTrip.id,
      tripTitle: targetTrip.title,
      destination: targetTrip.destination,
      status: 'upcoming',
      dates: targetTrip.dates,
      startDate: targetTrip.startDate,
      travelers: travelersCount,
      totalPaid: totalAmount,
      image: targetTrip.images[0],
      organizer: targetTrip.organizer.name,
      meetingPoint: targetTrip.meetingPoint,
      transportInfo: targetTrip.transport,
      stayInfo: targetTrip.stayDetails,
      specialRequests: requestData.specialRequirements || 'None',
      budgetTracker: {
        target: totalAmount + 5000,
        spent: totalAmount,
        expenses: [{ id: `exp_${Date.now()}`, item: `Trip Package (${travelersCount} Travelers)`, amount: totalAmount, category: 'Package' }],
      },
      packingChecklist: [
        { id: `c_${Date.now()}_1`, text: 'Valid Government Photo ID', done: true },
        { id: `c_${Date.now()}_2`, text: 'Warm fleece jacket & layers', done: false },
        { id: `c_${Date.now()}_3`, text: 'Water bottle & basic medicines', done: false },
      ],
    };

    setMyTrips((prev) => [newBooking, ...prev]);

    // Update spot count on the trip
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            currentGroupSize: t.currentGroupSize + travelersCount,
            spotsLeft: Math.max(0, t.spotsLeft - travelersCount),
          };
        }
        return t;
      })
    );

    // Add a Notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: 'Trip Request Confirmed! 🎒',
      desc: `You have successfully joined "${targetTrip.title}". Group workspace is now active!`,
      time: 'Just now',
      unread: true,
      link: { page: 'my-trips', params: { tab: 'upcoming' } },
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(`You're going to ${targetTrip.destination}! Trip added to My Trips.`, 'success');
  };

  // Stay Reservation Operation (Section 12)
  const reserveStay = (stayId, reservationData) => {
    const targetStay = stays.find((s) => s.id === stayId);
    if (!targetStay) return;

    const reservationId = `RES-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRes = {
      reservationId,
      stayId: targetStay.id,
      stayName: targetStay.name,
      location: targetStay.location,
      image: targetStay.images[0],
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      guests: reservationData.guests,
      roomName: reservationData.roomName,
      totalAmount: reservationData.totalAmount,
      status: 'confirmed',
    };

    setStayBookings((prev) => [newRes, ...prev]);

    // Add notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: 'Stay Reservation Confirmed! 🏡',
      desc: `Your reservation at ${targetStay.name} is confirmed. Booking ID: ${reservationId}.`,
      time: 'Just now',
      unread: true,
      link: { page: 'my-trips', params: { tab: 'upcoming' } },
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(`Reservation confirmed at ${targetStay.name}!`, 'success');
  };

  // List a Trip Operation (Section 5)
  const addNewTrip = (newTripData) => {
    const newTrip = {
      id: `trip-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      currentGroupSize: 1,
      spotsLeft: Number(newTripData.maxGroupSize || 10) - 1,
      verifiedOrganizer: true,
      featured: true,
      organizer: {
        id: currentUser?.id || 'usr_aarav',
        name: currentUser?.name || 'Aarav Sharma',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        rating: 5.0,
        tripsHosted: (currentUser?.tripsHosted || 0) + 1,
        verified: true,
      },
      travelerAvatars: [currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'],
      ...newTripData,
    };

    setTrips((prev) => [newTrip, ...prev]);

    // Add notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      title: 'Your Trip is Live! 🚀',
      desc: `"${newTrip.title}" has been published and is now open for travelers to join.`,
      time: 'Just now',
      unread: true,
      link: { page: 'trip-detail', params: { id: newTrip.id } },
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addToast(`Trip "${newTrip.title}" published successfully!`, 'success');
    return newTrip;
  };

  // Trip Workspace Operations (Section 16)
  const togglePackingItem = (bookingId, checkId) => {
    setMyTrips((prev) =>
      prev.map((t) => {
        if (t.bookingId === bookingId) {
          return {
            ...t,
            packingChecklist: t.packingChecklist.map((c) =>
              c.id === checkId ? { ...c, done: !c.done } : c
            ),
          };
        }
        return t;
      })
    );
  };

  const addPackingItem = (bookingId, text) => {
    setMyTrips((prev) =>
      prev.map((t) => {
        if (t.bookingId === bookingId) {
          return {
            ...t,
            packingChecklist: [...t.packingChecklist, { id: `chk_${Date.now()}`, text, done: false }],
          };
        }
        return t;
      })
    );
    addToast('Item added to packing checklist', 'info');
  };

  const addWorkspaceExpense = (bookingId, expense) => {
    setMyTrips((prev) =>
      prev.map((t) => {
        if (t.bookingId === bookingId) {
          const newExp = { id: `exp_${Date.now()}`, ...expense };
          const newSpent = t.budgetTracker.spent + Number(expense.amount || 0);
          return {
            ...t,
            budgetTracker: {
              ...t.budgetTracker,
              spent: newSpent,
              expenses: [...t.budgetTracker.expenses, newExp],
            },
          };
        }
        return t;
      })
    );
    addToast('Expense recorded in Trip Budget', 'success');
  };

  // Messaging Operations (Section 15)
  const sendMessage = (convId, text, image = null) => {
    if (!text.trim() && !image) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: currentUser?.name || 'You',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      text,
      image,
      time: 'Just now',
      isSelf: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === convId) {
          return {
            ...conv,
            lastMessage: `${currentUser?.name || 'You'}: ${text || 'Sent an image'}`,
            lastTime: 'Just now',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    // Simulate friendly host / buddy reply after 2.5s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === convId) {
            const replies = [
              'Awesome! Looking forward to this trek.',
              'Got it! That sounds like a great plan.',
              'Count me in! Packing my mountain gear tonight.',
              'Thanks for the update! See you soon.',
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const autoMsg = {
              id: `msg_${Date.now()}`,
              sender: 'Aarav Sharma',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              text: randomReply,
              time: 'Just now',
              isSelf: false,
            };
            return {
              ...conv,
              lastMessage: `Aarav Sharma: ${randomReply}`,
              lastTime: 'Just now',
              messages: [...conv.messages, autoMsg],
            };
          }
          return conv;
        })
      );
    }, 2500);
  };

  // Stories Operations (Section 18)
  const toggleStoryLike = (storyId) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const nextLiked = !s.isLiked;
          return {
            ...s,
            isLiked: nextLiked,
            likes: nextLiked ? s.likes + 1 : s.likes - 1,
          };
        }
        return s;
      })
    );
  };

  const addStory = (storyData) => {
    const newStory = {
      id: `story-${Date.now()}`,
      author: currentUser?.name || 'Traveler',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      date: 'Just now',
      likes: 1,
      isLiked: true,
      ...storyData,
    };
    setStories((prev) => [newStory, ...prev]);
    setWriteStoryModalOpen(false);
    addToast('Your travel story has been published to the community!', 'success');
  };

  // Smart Plan Operations (Section 7)
  const generatePlan = (criteria = {}) => {
    const destination = criteria.destination || criteria.destinationObj || (selectedLocation ? selectedLocation.fullName : 'Dehradun, Uttarakhand, India');
    const origin = criteria.origin || criteria.startingLocation || criteria.originObj || 'Delhi, NCT of Delhi, India';

    const generated = generateTripPlan({
      ...criteria,
      destination,
      origin,
    });

    setSmartPlan(generated);
    navigate('plan-result');
    addToast(`Authentic smart plan generated for ${generated.destinationCity || 'your destination'}!`, 'success');
    return generated;
  };

  const removePlanActivity = (dayIndex, actIndex) => {
    setSmartPlan((prev) => {
      const updatedDays = [...prev.dayByDay];
      updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter((_, idx) => idx !== actIndex);
      return { ...prev, dayByDay: updatedDays };
    });
    addToast('Activity removed from plan', 'info');
  };

  const addPlanActivity = (dayIndex, activity) => {
    setSmartPlan((prev) => {
      const updatedDays = [...prev.dayByDay];
      updatedDays[dayIndex].activities.push(activity);
      return { ...prev, dayByDay: updatedDays };
    });
    addToast('Activity added to itinerary!', 'success');
  };

  // Notification Operations
  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast('All notifications marked as read', 'info');
  };

  const unreadNotificationCount = notifications.filter((n) => n.unread).length;

  return (
    <StoreContext.Provider
      value={{
        // User & Auth
        currentUser,
        setCurrentUser,
        switchUser,
        loginUser,
        logoutUser,
        allUsers: INITIAL_USERS,

        // Route & Navigation
        currentRoute,
        navigate,

        // Currency
        currency,
        setCurrency,
        formatPrice,

        // Catalog Data
        trips,
        stays,
        buddies,
        stories,
        conversations,
        notifications,
        smartPlan,
        selectedLocation,
        setSelectedLocation,
        myTrips,
        stayBookings,

        // Saved Items
        savedTrips,
        savedStays,
        savedBuddies,
        toggleSaveTrip,
        toggleSaveStay,
        toggleSaveBuddy,
        isTripSaved,
        isStaySaved,
        isBuddySaved,

        // Actions
        joinTrip,
        reserveStay,
        addNewTrip,
        toggleBuddyConnect,
        sendMessage,
        activeConvId,
        setActiveConvId,
        toggleStoryLike,
        addStory,
        generatePlan,
        removePlanActivity,
        addPlanActivity,
        togglePackingItem,
        addPackingItem,
        addWorkspaceExpense,

        // Notifications
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,
        notificationDrawerOpen,
        setNotificationDrawerOpen,

        // Toasts
        toasts,
        addToast,
        removeToast,

        // Global Modals State
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        joinTripModalData,
        setJoinTripModalData,
        reserveStayModalData,
        setReserveStayModalData,
        videoTourModalOpen,
        setVideoTourModalOpen,
        searchModalOpen,
        setSearchModalOpen,
        shareModalData,
        setShareModalData,
        writeStoryModalOpen,
        setWriteStoryModalOpen,
        writeReviewModalData,
        setWriteReviewModalData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
