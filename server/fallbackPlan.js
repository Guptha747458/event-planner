/**
 * Intelligent procedural fallback plan generator.
 * Used when Gemini API is offline, key is not provided, or as robust fallback if parsing fails.
 */

export function generateFallbackPlan(metadata) {
  const {
    eventType = 'Wedding',
    date = '2026-10-15',
    guestCount = 100,
    totalBudget = 15000,
    city = 'San Francisco, CA',
    stylePreference = 'Rustic Elegance'
  } = metadata;

  const numericBudget = Number(totalBudget) || 15000;
  const guests = Number(guestCount) || 100;

  // Tailor budget percentages by event type
  let percentages = {
    venue: 0.35,
    catering: 0.30,
    decor: 0.12,
    photography: 0.10,
    attire: 0.08,
    misc: 0.05
  };

  if (eventType.toLowerCase().includes('birthday')) {
    percentages = {
      venue: 0.25,
      catering: 0.35,
      decor: 0.20,
      photography: 0.08,
      attire: 0.04,
      misc: 0.08
    };
  } else if (eventType.toLowerCase().includes('community')) {
    percentages = {
      venue: 0.30,
      catering: 0.25,
      decor: 0.15,
      photography: 0.05,
      attire: 0.02,
      misc: 0.23
    };
  }

  const budgetAllocation = {
    venue: Math.round(numericBudget * percentages.venue),
    catering: Math.round(numericBudget * percentages.catering),
    decor: Math.round(numericBudget * percentages.decor),
    photography: Math.round(numericBudget * percentages.photography),
    attire: Math.round(numericBudget * percentages.attire),
    misc: Math.round(numericBudget * percentages.misc)
  };

  // Adjust any rounding discrepancy to venue
  const totalAllocated = Object.values(budgetAllocation).reduce((a, b) => a + b, 0);
  if (totalAllocated !== numericBudget) {
    budgetAllocation.venue += (numericBudget - totalAllocated);
  }

  // Generate timeline tasks based on event type
  const isWedding = eventType.toLowerCase().includes('wedding');
  const isBirthday = eventType.toLowerCase().includes('birthday');

  const timelineTasks = [
    {
      id: 'task-1',
      title: isWedding ? 'Finalize venue and sign contract' : 'Reserve event space or park pavilion',
      phase: '6 Months Out',
      category: 'Venue',
      priority: 'Critical',
      completed: true,
      dueDate: 'Month 1',
      notes: `Target venue in ${city} suitable for ${guests} guests.`
    },
    {
      id: 'task-2',
      title: isWedding ? 'Book wedding photographer & videographer' : 'Hire event photographer or photo booth',
      phase: '5 Months Out',
      category: 'Photography',
      priority: 'High',
      completed: false,
      dueDate: 'Month 2',
      notes: `Review portfolios matching ${stylePreference} visual style.`
    },
    {
      id: 'task-3',
      title: 'Taste testing & menu selection with caterer',
      phase: '4 Months Out',
      category: 'Catering',
      priority: 'High',
      completed: false,
      dueDate: 'Month 3',
      notes: `Accommodate dietary restrictions for ${guests} attendees.`
    },
    {
      id: 'task-4',
      title: `Source ${stylePreference} decor elements & lighting`,
      phase: '3 Months Out',
      category: 'Decor',
      priority: 'Medium',
      completed: false,
      dueDate: 'Month 4',
      notes: 'Finalize floral arrangements, centerpieces, and atmospheric fairy lights.'
    },
    {
      id: 'task-5',
      title: 'Send digital/print invitations & open RSVP tracking',
      phase: '2 Months Out',
      category: 'Misc',
      priority: 'Critical',
      completed: false,
      dueDate: 'Month 5',
      notes: `Track confirmations towards target of ${guests} guests.`
    },
    {
      id: 'task-6',
      title: isWedding ? 'Finalize attire fittings & accessories' : 'Order custom event favors & signage',
      phase: '1 Month Out',
      category: 'Attire',
      priority: 'Medium',
      completed: false,
      dueDate: 'Month 6',
      notes: 'Ensure all styling fits the curated color palette.'
    },
    {
      id: 'task-7',
      title: 'Reconfirm all vendor arrivals & timeline schedule',
      phase: '1 Week Out',
      category: 'Vendors',
      priority: 'High',
      completed: false,
      dueDate: 'Final Week',
      notes: 'Distribute day-of contact sheet to coordinator and venue manager.'
    },
    {
      id: 'task-8',
      title: `Event Day: Celebrate ${eventType}!`,
      phase: 'Event Day',
      category: 'Coordination',
      priority: 'Critical',
      completed: false,
      dueDate: date,
      notes: 'Relax, stay hydrated, and enjoy unforgettable memories!'
    }
  ];

  // Vendors list
  const vendors = [
    {
      id: 'v-1',
      category: 'Venue',
      name: `${city.split(',')[0]} Scenic Garden & Hall`,
      estimatedCost: budgetAllocation.venue,
      actualCost: budgetAllocation.venue,
      status: 'Booked',
      contact: 'events@venueplace.com',
      notes: `Capacity for ${guests} guests. Includes chairs & tables.`
    },
    {
      id: 'v-2',
      category: 'Caterer',
      name: 'Artisan Feast Catering Co.',
      estimatedCost: budgetAllocation.catering,
      actualCost: budgetAllocation.catering,
      status: 'Reached Out',
      contact: 'tasting@artisanfeast.com',
      notes: 'Farm-to-table buffet with vegetarian and gluten-free choices.'
    },
    {
      id: 'v-3',
      category: 'Photographer',
      name: 'Golden Hour Visuals',
      estimatedCost: budgetAllocation.photography,
      actualCost: budgetAllocation.photography,
      status: 'Reached Out',
      contact: 'hello@goldenhourvisuals.com',
      notes: 'Full day coverage with drone captures and edited online gallery.'
    },
    {
      id: 'v-4',
      category: 'Florist',
      name: 'Bloom & Petal Design',
      estimatedCost: Math.round(budgetAllocation.decor * 0.6),
      actualCost: 0,
      status: 'Not Contacted',
      contact: 'orders@bloompetal.com',
      notes: `Seasonal arrangements complementing ${stylePreference} theme.`
    },
    {
      id: 'v-5',
      category: 'DJ/Band',
      name: 'Vibrant Sound Collective',
      estimatedCost: Math.round(budgetAllocation.misc * 0.5),
      actualCost: 0,
      status: 'Not Contacted',
      contact: 'dj@vibrantsound.com',
      notes: 'Full sound system, microphone for speeches, curated evening playlist.'
    },
    {
      id: 'v-6',
      category: isWedding ? 'Officiant' : 'Host / MC',
      name: isWedding ? 'Ceremony Life Officiants' : 'Community MC & Host',
      estimatedCost: isWedding ? 450 : 350,
      actualCost: 0,
      status: 'Not Contacted',
      contact: 'info@ceremonylife.com',
      notes: 'Personalized script and vows coordination.'
    },
    {
      id: 'v-7',
      category: 'Rentals',
      name: 'Premier Event Linen & Lighting',
      estimatedCost: Math.round(budgetAllocation.decor * 0.4),
      actualCost: 0,
      status: 'Not Contacted',
      contact: 'rentals@premierevent.com',
      notes: 'Bistro lighting canopy and ambient uplighting.'
    }
  ];

  // 6 personalized surprise-me ideas
  const ideas = generateFallbackIdeas(metadata);

  return {
    metadata: {
      ...metadata,
      totalBudget: numericBudget,
      guestCount: guests
    },
    budget: budgetAllocation,
    timeline: timelineTasks,
    vendors,
    ideas
  };
}

export function generateFallbackIdeas(metadata) {
  const {
    eventType = 'Wedding',
    totalBudget = 15000,
    stylePreference = 'Rustic Elegance',
    city = 'Local Area'
  } = metadata;

  const budgetNum = Number(totalBudget) || 15000;
  const isWedding = eventType.toLowerCase().includes('wedding');
  const isBirthday = eventType.toLowerCase().includes('birthday');

  if (isBirthday) {
    return [
      {
        id: 'idea-1',
        title: 'Retro Arcade & Glow Night',
        tagline: 'High energy neon celebration',
        estimatedCost: '$800 - $1,500',
        description: 'Transform the space into an 80s arcade lounge with blacklight fixtures, retro candy bar, and portable vintage gaming stations.',
        diyTip: 'Buy neon fluorescent paper tape to create geometric floor patterns under blacklights for under $30.',
        highlight: 'Interactive & Nostalgic'
      },
      {
        id: 'idea-2',
        title: 'Artisan Mocktail & Boba Lounge',
        tagline: 'Craft your custom beverage signature',
        estimatedCost: '$400 - $850',
        description: 'A stylish interactive beverage bar with customized syrups, popping boba, edible glitter, and fresh botanical garnishes.',
        diyTip: 'Freeze edible pansies or berries into clear ice cubes 48 hours prior for an Instagram-worthy look.',
        highlight: 'Crowd Favorite'
      },
      {
        id: 'idea-3',
        title: 'Outdoor Silent Disco Under the Stars',
        tagline: 'Dance without noise complaints',
        estimatedCost: '$500 - $900',
        description: 'Rent 3-channel LED wireless headphones allowing guests to switch between Pop, Hip-Hop, and Retro classics on the patio.',
        diyTip: 'String warm LED fairy lights in tree branches to build an ethereal late-night dance floor.',
        highlight: 'Zero Sound Curfew Issues'
      },
      {
        id: 'idea-4',
        title: 'Custom Photo Op Wall with Polaroids',
        tagline: 'Instant tangible guestbook souvenirs',
        estimatedCost: '$250 - $450',
        description: 'Build a lush green moss or flower backdrop with a custom neon name sign, where guests snap and peg mini polaroids to string.',
        diyTip: 'Use faux boxwood panels from home supply stores clipped to a collapsible garment rack.',
        highlight: 'Keepsake Value'
      },
      {
        id: 'idea-5',
        title: 'Gourmet Slider & Loaded Taco Station',
        tagline: 'Elevated comfort food bites',
        estimatedCost: '$600 - $1,200',
        description: 'Interactive food stations featuring miniature brioche smashburgers, carnitas street tacos, and artisan dipping sauces.',
        diyTip: 'Serve condiments in vintage mini mason jars with handwritten chalk labels.',
        highlight: 'Budget-Smart Catering'
      },
      {
        id: 'idea-6',
        title: 'Surprise Midnight Dessert Bar Flambé',
        tagline: 'Dramatic culinary finale',
        estimatedCost: '$300 - $600',
        description: 'Surprise guests with a late-night s’mores fire pit or warm churros station served with dark chocolate chili ganache.',
        diyTip: 'Use clean ceramic planters filled with food-safe chafing fuel cans hidden under polished river stones.',
        highlight: 'Memorable Climax'
      }
    ];
  }

  if (!isWedding) {
    // Community event
    return [
      {
        id: 'idea-1',
        title: 'Community Artisan & Makers Pavilion',
        tagline: 'Showcasing neighborhood creativity',
        estimatedCost: '$600 - $1,200',
        description: 'Designate a central bazaar circle where local craftspeople, bakers, and artisans can demo their talents.',
        diyTip: 'Partner with local high school art departments for volunteer signage painters.',
        highlight: 'Civic Engagement'
      },
      {
        id: 'idea-2',
        title: 'Acoustic Porch Concert Stage',
        tagline: 'Intimate multi-genre live music',
        estimatedCost: '$500 - $1,000',
        description: 'Create a cozy stage platform using wooden pallets, Persian-style rugs, and hay bale seating for local singer-songwriters.',
        diyTip: 'Borrow rugs and floor cushions from neighborhood donors for instant charm.',
        highlight: 'Warm Atmosphere'
      },
      {
        id: 'idea-3',
        title: 'Interactive Community Mural Wall',
        tagline: 'Collaborative public art piece',
        estimatedCost: '$200 - $400',
        description: 'Set up an oversized primed canvas where every attendee paints a designated numbered tile representing neighborhood unity.',
        diyTip: 'Pre-draw a light pencil grid with simple botanical or cityscape geometry.',
        highlight: 'Permanent Legacy'
      },
      {
        id: 'idea-4',
        title: 'Local Food Truck Rally & Picnic Lawn',
        tagline: 'Zero upfront catering risk',
        estimatedCost: '$200 - $500',
        description: 'Invite 4 top local food trucks to park around a central picnic lawn with picnic blankets and lawn games.',
        diyTip: 'Ask trucks for a small vendor fee that offsets park permit costs entirely.',
        highlight: 'Cost Neutral'
      },
      {
        id: 'idea-5',
        title: 'Giant Lawn Games Tournament',
        tagline: 'All-ages fun and friendly rivalry',
        estimatedCost: '$250 - $450',
        description: 'Oversized Jenga, cornhole with custom neighborhood stencils, giant Connect Four, and bocce ball tournament brackets.',
        diyTip: 'Cut 2x4 lumber scraps and sand edges smooth to build a giant tumbling tower for under $25.',
        highlight: 'Multi-Generational'
      },
      {
        id: 'idea-6',
        title: 'Sunset Lantern & Stargazing Hour',
        tagline: 'Magical dusk transition',
        estimatedCost: '$300 - $600',
        description: 'Distribute safe LED solar paper lanterns to attendees at twilight and invite the local amateur astronomy club with telescopes.',
        diyTip: 'Pre-order bulk biodegradable LED paper lanterns online well in advance.',
        highlight: 'Enchanting Finish'
      }
    ];
  }

  // Wedding ideas tailored to stylePreference and totalBudget
  return [
    {
      id: 'idea-1',
      title: `${stylePreference} Greenhouse or Botanical Sanctuary`,
      tagline: 'Natural architecture reduces floral costs',
      estimatedCost: `$${Math.round(budgetNum * 0.28).toLocaleString()} venue fee`,
      description: `Host the ceremony surrounded by living lush greenery in ${city}, dramatically reducing spend on cut flowers while providing breathtaking natural light.`,
      diyTip: 'Incorporate potted nursery ferns down the aisle that can later be planted in your home garden.',
      highlight: 'Eco-Luxury'
    },
    {
      id: 'idea-2',
      title: 'Family-Style Tuscan Candlelit Banquet',
      tagline: 'Warm communion over artisan shared platters',
      estimatedCost: `$${Math.round(budgetNum * 0.25).toLocaleString()} catering`,
      description: 'Long wooden communal farm tables with taper candles, warm crusty sourdough, olive oil carafes, and shared rustic roasted entrees.',
      diyTip: 'Collect vintage wine bottles to hold tall ivory taper candles at varied heights.',
      highlight: 'Intimate & Lively'
    },
    {
      id: 'idea-3',
      title: 'Audio Guestbook in a Vintage Rotary Phone',
      tagline: 'Hear the laughter and voices forever',
      estimatedCost: '$200 - $400 rental',
      description: 'Guests pick up a 1970s rotary phone, hear your recorded greeting, and leave heartfelt, tipsy, and tearful voice messages.',
      diyTip: 'Place a small framed instruction card with warm fairy lights on a wooden side table.',
      highlight: 'Timeless Keepsake'
    },
    {
      id: 'idea-4',
      title: 'Golden Hour Champagne & Grazing Wall',
      tagline: 'Effortless transition into cocktail reception',
      estimatedCost: '$450 - $800',
      description: 'A botanical display wall holding flutes of chilled prosecco and individual charcuterie cones ready for guests exiting the ceremony.',
      diyTip: 'Roll brown parchment cones filled with rosemary sprigs, sharp cheddar cubes, and grapes.',
      highlight: 'Photo Magnet'
    },
    {
      id: 'idea-5',
      title: 'Custom Signature Scent & Candle Wedding Favors',
      tagline: 'Memory linked through botanical fragrance',
      estimatedCost: '$300 - $550 for 100 guests',
      description: `Infuse the venue with a signature fragrance matching ${stylePreference} (e.g. Amber & Cedarwood), and gift guests matching mini travel soy candles.`,
      diyTip: 'Host a fun candle-pouring date night with your partner to hand-pour 4oz tins with custom sticker labels.',
      highlight: 'Sensory Recall'
    },
    {
      id: 'idea-6',
      title: 'Sparkler & Acoustic Serenade Send-Off',
      tagline: 'Golden luminous farewell',
      estimatedCost: '$150 - $350',
      description: 'A dazzling pathway of 36-inch smokeless sparklers as an acoustic duo plays your favorite ballad for your final exit.',
      diyTip: 'Prepare metal buckets filled with sand and branded matches for safe extinguishing.',
      highlight: 'Cinematic Grand Finale'
    }
  ];
}
