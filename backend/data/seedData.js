/**
 * AegisTrace Synthetic Threat Intelligence Seed Dataset
 * Contains 18 realistic dark web threat actor profiles, clearnet infrastructure records,
 * cryptocurrency exchange deposit points, and multi-input UTXO transactions.
 */

export const clearnetDatabase = [
  {
    id: "CLEAN-HOST-01",
    ip: "185.220.101.44",
    hostname: "vps-srv-44.ovh-node.net",
    domain: "krypt-panel-backup.net",
    asn: 16276,
    isp: "OVH SAS",
    country: "FR",
    ssl_cert: {
      sha256_fingerprint: "a9f3b2c1e8d47056e9c0114a87b32ef8a1c90234d7f5619a0bc45ef20138abcd",
      subject_cn: "krypt-panel-backup.net",
      issuer_o: "Let's Encrypt",
      valid_to: "2027-01-15"
    },
    ssh_host_key: "SHA256:7mK9pQ1wXyZ3vB5nC8rT2sF6jL0hN4uE",
    server_banner: "nginx/1.24.0 (Ubuntu)",
    favicon_hash: "983210459"
  },
  {
    id: "CLEAN-HOST-02",
    ip: "194.26.29.112",
    hostname: "node88.m247.ro",
    domain: "volcano-api-relay.org",
    asn: 9009,
    isp: "M247 Ltd",
    country: "RO",
    ssl_cert: {
      sha256_fingerprint: "5e2b8104c3f9a7d2e0b51688942a1ef6c4193027b8e1f5d263901bcae543fedc",
      subject_cn: "volcano-api-relay.org",
      issuer_o: "ZeroSSL",
      valid_to: "2026-11-20"
    },
    ssh_host_key: "SHA256:volcano8892keyNodeRomHost2026",
    server_banner: "Apache/2.4.52 (Debian)",
    favicon_hash: "-129482019"
  },
  {
    id: "CLEAN-HOST-03",
    ip: "91.240.118.67",
    hostname: "srv-fastflux.flokinet.is",
    domain: "zerobyte-c2-mirror.is",
    asn: 200651,
    isp: "FlokiNET",
    country: "IS",
    ssl_cert: {
      sha256_fingerprint: "11aa22bb33cc44dd55ee66ff77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd",
      subject_cn: "zerobyte-c2-mirror.is",
      issuer_o: "Let's Encrypt",
      valid_to: "2026-09-30"
    },
    ssh_host_key: "SHA256:9xP3kL8mR2sW0vT4yZ7bC1nE5jH6uF8q",
    server_banner: "nginx/1.22.1-custom-build",
    favicon_hash: "447192801"
  }
];

export const knownExchanges = [
  {
    id: "EX-BINANCE-KRYPTON",
    name: "Binance KYC Deposit Account [User ID #89210-KYC]",
    address: "1KryptonVektorBinanceDeposit998811",
    currency: "BTC",
    kycRequired: true,
    riskRating: "HIGH_DE_ANONYMIZATION_TARGET"
  },
  {
    id: "EX-BINANCE-SILK",
    name: "Binance OTC Deposit Vault [User ID #44102-KYC]",
    address: "1SilkHydraBinanceDeposit443322",
    currency: "BTC",
    kycRequired: true,
    riskRating: "HIGH_DE_ANONYMIZATION_TARGET"
  },
  {
    id: "EX-WASABI-01",
    name: "Wasabi CoinJoin 2.0 Liquidity Pool",
    address: "bc1qs6g5m3u9w8e7r2t1y4u7i0o9p8a7s6d5f4g3h2",
    currency: "BTC",
    kycRequired: false,
    riskRating: "WASABI_MIXER_OBSCURITY"
  },
  {
    id: "EX-KRAKEN-VOLCANO",
    name: "Kraken Verified Merchant Account [Volcano-Stresser]",
    address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",
    currency: "BTC",
    kycRequired: true,
    riskRating: "HIGH_DE_ANONYMIZATION_TARGET"
  }
];

export const mockTransactions = [
  // Cluster 1: KryptonGhost <-> VektorZero shared multi-input transaction & Wasabi mixing
  {
    txHash: "8f7a9c1e3d5b20486a9c0114a87b32ef8a1c90234d7f5619a0bc45ef201389aa",
    currency: "BTC",
    timestamp: "2026-04-12T03:15:22Z",
    inputs: [
      "bc1qkrypton0982x7a9c1e3d5b20486a9c0114a87b",
      "1VektorZeroBtcEscrow992384aBcD789123",
      "bc1qaffiliatecoordinatormix88219034"
    ],
    outputs: [
      { address: "bc1qs6g5m3u9w8e7r2t1y4u7i0o9p8a7s6d5f4g3h2", amount: 4.85 }, // Wasabi mixer
      { address: "1KryptonVektorBinanceDeposit998811", amount: 2.10 },          // Binance KYC cashout
      { address: "bc1qchangekryptonvektor908123847192", amount: 0.44 }
    ]
  },
  // Cluster 2: SilkCobalt <-> HydraMedic common payout to Binance KYC address
  {
    txHash: "2b9a7c4d1e8f003399aa88bb77cc66dd55ee44ff33aa22bb11cc00dd99ee88ff",
    currency: "BTC",
    timestamp: "2026-05-18T21:40:10Z",
    inputs: [
      "bc1qsilkprecursorpharm98234710293847192",
      "3HydraMedicSupplyChainVault99882211"
    ],
    outputs: [
      { address: "1SilkHydraBinanceDeposit443322", amount: 8.50 }, // Shared Binance deposit!
      { address: "bc1qpharmachangeoutput887711223344", amount: 1.15 }
    ]
  },
  // Cluster 3: VolcanoStress <-> CinderLock booter subscription co-spend
  {
    txHash: "77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd77ee88ff99aa00bb11cc22dd",
    currency: "BTC",
    timestamp: "2026-06-02T14:20:00Z",
    inputs: [
      "1CinderLockBooterApiWallet99881122",
      "1VolcanoStressDirectNodePay8833221"
    ],
    outputs: [
      { address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", amount: 1.75 }, // Kraken deposit
      { address: "1ChangeAddressStresser991823746", amount: 0.35 }
    ]
  }
];

export const actors = [
  // --- PAIR 1: KryptonGhost <-> VektorZero (High Confidence Target Case 1: Ransomware Syndicate) ---
  {
    id: "ACTOR-001",
    suspectedIdentity: { name: "Vikram Nair", location: "Bengaluru, Karnataka", matchedVia: "Wallet + PGP key correlation" },
    handle: "KryptonGhost",
    category: "Ransomware / Extortion",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80",
    source: "Dread / RAMP Underworld",
    lastSeen: "2026-08-28T04:12:00Z",
    specializations: ["ESXi Lockers", "Corporate Extortion", "Wasabi CoinJoin", "Negotiation TTPs"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "9FA2 C801 B53E 4D12 8890 19AA F712 90BC 44E1 098A",
    wallets: [
      { currency: "BTC", address: "bc1qkrypton0982x7a9c1e3d5b20486a9c0114a87b" },
      { currency: "XMR", address: "888tNkZrPN6JsE9923847192837461928374619283746192837461928374619283746192837461928374619283" }
    ],
    contact: {
      jabber: "kryptonghost@exploit.im",
      tox: "77F90AB88129034C182736459018237461928374619283746192837461928374",
      telegram: "kryptonghost_ops"
    },
    forums: ["Dread", "RAMP", "Exploit.in"],
    infrastructure: {
      onion_address: "krypton7x3qj9z8m2v1p4l6w5r0t8y7u1i3o5p7a9s1d3f5g7h9j1k3l5z7.onion",
      status_page_exposed: true,
      clearnet_ip_leaked: "185.220.101.44",
      ssl_cert: {
        sha256_fingerprint: "a9f3b2c1e8d47056e9c0114a87b32ef8a1c90234d7f5619a0bc45ef20138abcd",
        subject_cn: "krypt-panel-backup.net"
      },
      server_banner: "nginx/1.24.0 (Ubuntu)",
      ssh_host_key: "SHA256:7mK9pQ1wXyZ3vB5nC8rT2sF6jL0hN4uE",
      favicon_hash: "983210459"
    },
    samplePosts: [
      {
        timestamp: "2026-04-12T01:45:00Z",
        content: "New build with custom ChaCha20 + curve25519 payload ready for corporate targets. Private affiliate slots open for top tier pentesting teams only. Payment received and escrow released on dread. OPSEC is rule #1, no clearnet logging."
      },
      {
        timestamp: "2026-06-14T03:30:00Z",
        content: "Victim portal negotiations updated. Decryption keys released after 4.85 BTC confirmed on-chain. FUD crypter updated daily. Escrow guaranteed."
      },
      {
        timestamp: "2026-08-20T02:10:00Z",
        content: "Do not message regarding low tier targets under $500k rev. We only deal with network access brokers holding domain admin credentials. Contact on Tox or Jabber OTR."
      }
    ],
    transactions: [
      { txHash: "8f7a9c1e3d5b20486a9c0114a87b32ef8a1c90234d7f5619a0bc45ef201389aa", amount: 4.85, currency: "BTC", timestamp: "2026-04-12T03:15:22Z" }
    ]
  },
  {
    id: "ACTOR-002",
    suspectedIdentity: { name: "Rahul Mehta", location: "Pune, Maharashtra", matchedVia: "Wallet + PGP key correlation" },
    handle: "VektorZero",
    category: "Ransomware / Extortion",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    source: "Exploit.in / XSS",
    lastSeen: "2026-08-27T03:50:00Z",
    specializations: ["ESXi Lockers", "Corporate Extortion", "Wasabi CoinJoin", "Network Intrusions"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "A011 BB77 CC22 3344 5566 7788 9900 AABB CCDD EEFF",
    wallets: [
      { currency: "BTC", address: "1VektorZeroBtcEscrow992384aBcD789123" },
      { currency: "BTC", address: "bc1qaffiliatecoordinatormix88219034" }
    ],
    contact: {
      jabber: "kryptonghost@exploit.im", // Shared Jabber!
      tox: "77F90AB88129034C182736459018237461928374619283746192837461928374", // Shared Tox!
      telegram: "vektor_affiliate_team"
    },
    forums: ["Exploit.in", "XSS", "RAMP"],
    infrastructure: {
      onion_address: "vektorlock79102834719283746192837461928374619283746192837.onion",
      status_page_exposed: true,
      clearnet_ip_leaked: "185.220.101.44", // Shared IP!
      ssl_cert: {
        sha256_fingerprint: "a9f3b2c1e8d47056e9c0114a87b32ef8a1c90234d7f5619a0bc45ef20138abcd", // Shared Cert!
        subject_cn: "krypt-panel-backup.net"
      },
      server_banner: "nginx/1.24.0 (Ubuntu)",
      ssh_host_key: "SHA256:7mK9pQ1wXyZ3vB5nC8rT2sF6jL0hN4uE",
      favicon_hash: "983210459"
    },
    samplePosts: [
      {
        timestamp: "2026-04-12T02:10:00Z",
        content: "Affiliate coordination update: payload tested on ESXi 7.0/8.0. ChaCha20 encryption fast and zero crash. Deal done and escrow released on dread for corporate drop. Strict OPSEC required, no clearnet logs."
      },
      {
        timestamp: "2026-06-14T04:15:00Z",
        content: "Payment received and verified from insurance negotiator. 4.85 BTC forwarded to cold mixer. FUD crypter updated daily. Contact on Jabber OTR or Tox."
      },
      {
        timestamp: "2026-08-25T03:05:00Z",
        content: "Looking for DA access brokers with persistent beacons in enterprise targets ($100m+ rev). Escrow guaranteed on Exploit.in."
      }
    ],
    transactions: [
      { txHash: "8f7a9c1e3d5b20486a9c0114a87b32ef8a1c90234d7f5619a0bc45ef201389aa", amount: 4.85, currency: "BTC", timestamp: "2026-04-12T03:15:22Z" }
    ]
  },

  // --- PAIR 2: SilkCobalt <-> HydraMedic (High Confidence Target Case 2: Darknet Narcotics Vendor) ---
  {
    id: "ACTOR-003",
    suspectedIdentity: { name: "Sai Kumar Reddy", location: "Hyderabad, Telangana", matchedVia: "Wallet + PGP key correlation" },
    handle: "SilkCobalt",
    category: "Darknet Supply / Narcotics",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    source: "Bohemia Marketplace / Dread",
    lastSeen: "2026-08-26T22:15:00Z",
    specializations: ["Pharmaceutical Precursors", "EU Stealth Shipping", "Steganographic Drops", "Multi-Sig Escrow"],
    activeRange: { startYear: 2022, endYear: 2026 },
    pgpFingerprint: "44C8 1902 EE91 7721 8843 0019 BBAA 8877 1122 3344",
    wallets: [
      { currency: "BTC", address: "bc1qsilkprecursorpharm98234710293847192" },
      { currency: "XMR", address: "899silkCobaltXmrVendorAddress9928374619283746192837461928374619283746192837461928374619283" }
    ],
    contact: {
      jabber: "silkprecursor@chatme.is",
      tox: "8899AACC112233445566778899AABBCCDDEEFF00112233445566778899AABBCC",
      telegram: "silk_direct_stealth"
    },
    forums: ["Dread", "Bohemia", "Archetyp"],
    infrastructure: {
      onion_address: "silkdirectpharma99823746192837461928374619283746192837.onion",
      status_page_exposed: false,
      clearnet_ip_leaked: null,
      ssl_cert: null,
      server_banner: "nginx/1.20.1",
      ssh_host_key: null,
      favicon_hash: "11992834"
    },
    samplePosts: [
      {
        timestamp: "2026-05-18T20:55:00Z",
        content: "New batch of 99.8% pure reagent lab certified. All orders vacuum sealed 4x with MBB anti-dog barrier. Shipped and tracking sent via PGP. Sent BTC to escrow release. Top EU/US delivery rate!"
      },
      {
        timestamp: "2026-07-10T21:30:00Z",
        content: "Restock completed. Bulk wholesale available with FE discount for verified Dread buyers. PGP encryption mandatory for all shipping addresses."
      }
    ],
    transactions: [
      { txHash: "2b9a7c4d1e8f003399aa88bb77cc66dd55ee44ff33aa22bb11cc00dd99ee88ff", amount: 8.50, currency: "BTC", timestamp: "2026-05-18T21:40:10Z" }
    ]
  },
  {
    id: "ACTOR-004",
    suspectedIdentity: { name: "Arjun Pillai", location: "Kochi, Kerala", matchedVia: "Wallet + PGP key correlation" },
    handle: "HydraMedic",
    category: "Darknet Supply / Narcotics",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    source: "Archetyp / Dread",
    lastSeen: "2026-08-25T21:10:00Z",
    specializations: ["Pharmaceutical Precursors", "EU Stealth Shipping", "Bulk Lab Logistics"],
    activeRange: { startYear: 2022, endYear: 2026 },
    pgpFingerprint: "44C8 1902 EE91 7721 8843 0019 BBAA 8877 1122 3344", // Identical PGP!
    wallets: [
      { currency: "BTC", address: "3HydraMedicSupplyChainVault99882211" }
    ],
    contact: {
      jabber: "silkprecursor@chatme.is", // Identical Jabber!
      tox: "8899AACC112233445566778899AABBCCDDEEFF00112233445566778899AABBCC",
      telegram: "hydra_medic_vendor"
    },
    forums: ["Archetyp", "Dread", "Incognito"],
    infrastructure: {
      onion_address: "hydramedsupply9982347102938471928374619283746192837461.onion",
      status_page_exposed: false,
      clearnet_ip_leaked: null,
      ssl_cert: null,
      server_banner: "nginx/1.20.1",
      ssh_host_key: null,
      favicon_hash: "11992834"
    },
    samplePosts: [
      {
        timestamp: "2026-05-18T21:05:00Z",
        content: "Wholesale listing live on Archetyp. Vacuum sealed 4x with MBB stealth. Shipped and tracking sent via PGP. Sent BTC to escrow release. Best prices for loyal customers."
      },
      {
        timestamp: "2026-07-12T22:00:00Z",
        content: "Always check PGP signature before sending coin. Direct bulk orders over 5kg handled through Jabber OTR only."
      }
    ],
    transactions: [
      { txHash: "2b9a7c4d1e8f003399aa88bb77cc66dd55ee44ff33aa22bb11cc00dd99ee88ff", amount: 8.50, currency: "BTC", timestamp: "2026-05-18T21:40:10Z" }
    ]
  },

  // --- PAIR 3: ZeroByte_Dev <-> NexusRogue (High Confidence Target Case 3: Exploit / Access Broker) ---
  {
    id: "ACTOR-005",
    suspectedIdentity: { name: "Karthik Subramaniam", location: "Chennai, Tamil Nadu", matchedVia: "Wallet + PGP key correlation" },
    handle: "ZeroByte_Dev",
    category: "Exploit Broker / 0-Day",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    source: "XSS.is / Exploit.in",
    lastSeen: "2026-08-27T18:40:00Z",
    specializations: ["Windows LPE 0-day", "Active Directory Bypass", "Custom Shellcode", "C2 Infrastructure"],
    activeRange: { startYear: 2024, endYear: 2026 },
    pgpFingerprint: "BB88 1122 3344 5566 7788 9900 1122 3344 5566 7788",
    wallets: [
      { currency: "BTC", address: "bc1qzerobyte0daybroker9982347102938471" },
      { currency: "XMR", address: "877zeroByteMoneroVault9928374619283746192837461928374619283746192837461928374619283" }
    ],
    contact: {
      jabber: "zerobyte@jabber.ru",
      tox: "11223344556677889900AABBCCDDEEFF00112233445566778899AABBCCDDEEFF",
      telegram: "zerobyte_c2"
    },
    forums: ["XSS.is", "Exploit.in"],
    infrastructure: {
      onion_address: "zerobytec2portal88371928374619283746192837461928374.onion",
      status_page_exposed: false,
      clearnet_ip_leaked: "91.240.118.67",
      ssl_cert: {
        sha256_fingerprint: "11aa22bb33cc44dd55ee66ff77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd",
        subject_cn: "zerobyte-c2-mirror.is"
      },
      server_banner: "nginx/1.22.1-custom-build",
      ssh_host_key: "SHA256:9xP3kL8mR2sW0vT4yZ7bC1nE5jH6uF8q",
      favicon_hash: "447192801"
    },
    samplePosts: [
      {
        timestamp: "2026-06-05T17:15:00Z",
        content: "Selling fresh 0day Windows Kernel LPE (all builds up to 24H2). Reliable, weaponized, bypasses CrowdStrike + Defender ATP. Price: $85,000 in XMR or BTC. Escrow on XSS via admin only."
      },
      {
        timestamp: "2026-07-22T19:00:00Z",
        content: "POC video provided to verified buyers. Do not message if you cannot afford escrow. Clean C code, no dependencies, no third party stubs."
      }
    ],
    transactions: []
  },
  {
    id: "ACTOR-006",
    suspectedIdentity: { name: "Naveen Chowdary", location: "Bengaluru, Karnataka", matchedVia: "Wallet + PGP key correlation" },
    handle: "NexusRogue",
    category: "Exploit Broker / 0-Day",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    source: "BreachForums / Telegram",
    lastSeen: "2026-08-26T19:20:00Z",
    specializations: ["Windows LPE 0-day", "Active Directory Bypass", "Corporate VPN Access", "C2 Infrastructure"],
    activeRange: { startYear: 2024, endYear: 2026 },
    pgpFingerprint: "CC99 2233 4455 6677 8899 0011 2233 4455 6677 8899",
    wallets: [
      { currency: "BTC", address: "bc1qnexusrogueinitialaccess882374619283" }
    ],
    contact: {
      jabber: "nexusrogue@exploit.im",
      tox: "556677889900AABBCCDDEEFF00112233445566778899AABBCCDDEEFF11223344",
      telegram: "nexus_rogue_access"
    },
    forums: ["BreachForums", "XSS.is"],
    infrastructure: {
      onion_address: "nexusrogueleakbase9982374619283746192837461928374619.onion",
      status_page_exposed: false,
      clearnet_ip_leaked: "91.240.118.67", // Shared IP mirror!
      ssl_cert: {
        sha256_fingerprint: "11aa22bb33cc44dd55ee66ff77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd", // Shared SSL Cert!
        subject_cn: "zerobyte-c2-mirror.is"
      },
      server_banner: "nginx/1.22.1-custom-build",
      ssh_host_key: "SHA256:9xP3kL8mR2sW0vT4yZ7bC1nE5jH6uF8q",
      favicon_hash: "447192801"
    },
    samplePosts: [
      {
        timestamp: "2026-06-05T17:40:00Z",
        content: "Corporate network access with Domain Admin access + weaponized Windows Kernel LPE. Clean C binary, bypasses CrowdStrike + Defender ATP with zero alerts. Escrow via forum admin."
      },
      {
        timestamp: "2026-07-22T19:35:00Z",
        content: "Serious inquiries only on Jabber OTR. Proof of funds required before sending technical telemetry or POC."
      }
    ],
    transactions: []
  },

  // --- PAIR 4: CinderLock <-> VolcanoStress (High Confidence Target Case 4: DDoS / Botnet Infrastructure) ---
  {
    id: "ACTOR-007",
    suspectedIdentity: { name: "Deepak Chauhan", location: "Delhi", matchedVia: "Wallet + PGP key correlation" },
    handle: "CinderLock",
    category: "DDoS / Botnet Ops",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    source: "Telegram / Darknet Hub",
    lastSeen: "2026-08-25T13:40:00Z",
    specializations: ["Mirai Botnet Variants", "Layer 7 Amplification", "OVH Bypass", "API Booter"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "EE77 4411 9922 8833 7744 6655 5544 3322 2211 0099",
    wallets: [
      { currency: "BTC", address: "1CinderLockBooterApiWallet99881122" }
    ],
    contact: {
      telegram: "cinderlock_stresser",
      jabber: "cinderlock@draugr.de"
    },
    forums: ["Telegram", "Nulled.to"],
    infrastructure: {
      onion_address: "cinderlockstress778234710293847192837461928374619283.onion",
      status_page_exposed: true,
      clearnet_ip_leaked: "194.26.29.112",
      ssl_cert: {
        sha256_fingerprint: "5e2b8104c3f9a7d2e0b51688942a1ef6c4193027b8e1f5d263901bcae543fedc",
        subject_cn: "volcano-api-relay.org"
      },
      server_banner: "Apache/2.4.52 (Debian)",
      ssh_host_key: "SHA256:volcano8892keyNodeRomHost2026",
      favicon_hash: "-129482019"
    },
    samplePosts: [
      {
        timestamp: "2026-06-02T13:45:00Z",
        content: "CinderLock API stresser online! 2.4 Tbps peak capacity with DNS/NTP/QUIC reflection. Bypasses Cloudflare UAM and Akamai. 1.75 BTC subscription tiers with API tokens."
      }
    ],
    transactions: [
      { txHash: "77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd77ee88ff99aa00bb11cc22dd", amount: 1.75, currency: "BTC", timestamp: "2026-06-02T14:20:00Z" }
    ]
  },
  {
    id: "ACTOR-008",
    suspectedIdentity: { name: "Manoj Yadav", location: "Lucknow, Uttar Pradesh", matchedVia: "Wallet + PGP key correlation" },
    handle: "VolcanoStress",
    category: "DDoS / Botnet Ops",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    source: "HackForums / Telegram",
    lastSeen: "2026-08-25T14:00:00Z",
    specializations: ["Mirai Botnet Variants", "Layer 7 Amplification", "OVH Bypass", "API Booter"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "FF11 2233 4455 6677 8899 AABB CCDD EEFF 0011 2233",
    wallets: [
      { currency: "BTC", address: "1VolcanoStressDirectNodePay8833221" }
    ],
    contact: {
      telegram: "cinderlock_stresser", // Shared TG handle!
      jabber: "volcanostress@draugr.de"
    },
    forums: ["HackForums", "Telegram"],
    infrastructure: {
      onion_address: "volcanostresser998234710293847192837461928374619283.onion",
      status_page_exposed: true,
      clearnet_ip_leaked: "194.26.29.112",
      ssl_cert: {
        sha256_fingerprint: "5e2b8104c3f9a7d2e0b51688942a1ef6c4193027b8e1f5d263901bcae543fedc",
        subject_cn: "volcano-api-relay.org"
      },
      server_banner: "Apache/2.4.52 (Debian)",
      ssh_host_key: "SHA256:volcano8892keyNodeRomHost2026",
      favicon_hash: "-129482019"
    },
    samplePosts: [
      {
        timestamp: "2026-06-02T13:50:00Z",
        content: "Volcano API booter updated with new L7 methods. 2.4 Tbps sustained attacks. Accepts BTC/XMR auto-activation. Strict no logs policy."
      }
    ],
    transactions: [
      { txHash: "77aa88bb99cc00dd11ee22ff33aa44bb55cc66dd77ee88ff99aa00bb11cc22dd", amount: 1.75, currency: "BTC", timestamp: "2026-06-02T14:20:00Z" }
    ]
  },

  // --- INDEPENDENT / UNCORRELATED PERSONAS (5 - 18) ---
  {
    id: "ACTOR-009",
    suspectedIdentity: { name: "Ajay Verma", location: "Jaipur, Rajasthan", matchedVia: "Wallet + PGP key correlation" },
    handle: "AlphaPhantom",
    category: "Financial Fraud / Carding",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    source: "Club2CRX / Verified",
    lastSeen: "2026-08-20T11:00:00Z",
    specializations: ["US/UK Dumps + PIN", "POS Skimming", "Bank Drops"],
    activeRange: { startYear: 2021, endYear: 2026 },
    pgpFingerprint: "1122 3344 5566 7788 9900 AABB CCDD EEFF 1122 3344",
    wallets: [{ currency: "BTC", address: "1AlphaPhantomCardingVault998822" }],
    contact: { jabber: "alphaphantom@jabbim.com", telegram: "alpha_dumps" },
    forums: ["Club2CRX", "Verified"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-10T12:00:00Z", content: "Fresh US fullz 95% valid rate with high balance. Auto checker in shop." }]
  },
  {
    id: "ACTOR-010",
    suspectedIdentity: { name: "Suresh Iyer", location: "Mumbai, Maharashtra", matchedVia: "Wallet + PGP key correlation" },
    handle: "DarkSentry_X",
    category: "Bulletproof Hosting",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    source: "Exploit.in",
    lastSeen: "2026-08-22T15:30:00Z",
    specializations: ["Offshore DMCA-ignored Servers", "Fast Flux DNS", "BGP Hijacking"],
    activeRange: { startYear: 2020, endYear: 2026 },
    pgpFingerprint: "2233 4455 6677 8899 0011 AABB CCDD EEFF 2233 4455",
    wallets: [{ currency: "BTC", address: "3DarkSentryHostingNodes8823746" }],
    contact: { jabber: "darksentry@exploit.im" },
    forums: ["Exploit.in", "XSS.is"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-15T16:00:00Z", content: "Dedicated 10Gbps unmetered servers located in Panama & Seychelles. No logs, crypto payments." }]
  },
  {
    id: "ACTOR-011",
    suspectedIdentity: { name: "Vamshi Krishna Reddy", location: "Hyderabad, Telangana", matchedVia: "Wallet + PGP key correlation" },
    handle: "RavenPayload",
    category: "Malware Development",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80",
    source: "Telegram / XSS",
    lastSeen: "2026-08-24T09:15:00Z",
    specializations: ["RedLine Stealer Clones", "Telegram C2 Exfiltration", "In-Memory Crypters"],
    activeRange: { startYear: 2024, endYear: 2026 },
    pgpFingerprint: "3344 5566 7788 9900 1122 AABB CCDD EEFF 3344 5566",
    wallets: [{ currency: "BTC", address: "bc1qravenpayloadstealerdev9988223" }],
    contact: { telegram: "raven_stealer_support" },
    forums: ["XSS.is", "Telegram"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-18T10:00:00Z", content: "RavenStealer v3.2 release: Grabs Discord tokens, browser sessions, MetaMask, Telegram session files in < 2 seconds." }]
  },
  {
    id: "ACTOR-012",
    suspectedIdentity: { name: "Chandrasekhar 'Chandu' Rao", location: "Vijayawada, Andhra Pradesh", matchedVia: "Wallet + PGP key correlation" },
    handle: "CrypticWarden",
    category: "Crypto Laundering / Mixers",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    source: "Dread",
    lastSeen: "2026-08-19T14:50:00Z",
    specializations: ["Monero Atomic Swaps", "Peeling Chains", "Cash-by-Mail"],
    activeRange: { startYear: 2022, endYear: 2026 },
    pgpFingerprint: "4455 6677 8899 0011 2233 AABB CCDD EEFF 4455 6677",
    wallets: [{ currency: "BTC", address: "bc1qcrypticwardenmixerpool778899" }],
    contact: { jabber: "crypticwarden@draugr.de" },
    forums: ["Dread"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-12T15:00:00Z", content: "Zero fee atomic swap bridge BTC -> XMR with non-custodial script execution." }]
  },
  {
    id: "ACTOR-013",
    suspectedIdentity: { name: "Praveen Reddy", location: "Bengaluru, Karnataka", matchedVia: "Wallet + PGP key correlation" },
    handle: "SpectreNode",
    category: "Network Recon / Proxy",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    source: "RAMP",
    lastSeen: "2026-08-18T17:10:00Z",
    specializations: ["Residential SOCKS5 Proxy", "4G Mobile Rotating Proxies"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "5566 7788 9900 1122 3344 AABB CCDD EEFF 5566 7788",
    wallets: [{ currency: "BTC", address: "1SpectreNodeProxyNetwork883719" }],
    contact: { telegram: "spectre_proxies" },
    forums: ["RAMP"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-14T18:00:00Z", content: "50,000 clean residential IPs in USA, Germany, Japan. 99.9% clean on MaxMind." }]
  },
  {
    id: "ACTOR-014",
    suspectedIdentity: { name: "Girish Nanda", location: "Ahmedabad, Gujarat", matchedVia: "Wallet + PGP key correlation" },
    handle: "CipherMaven",
    category: "Cryptanalysis / Tooling",
    threatLevel: "LOW",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    source: "GitHub / Exploit.in",
    lastSeen: "2026-08-21T08:20:00Z",
    specializations: ["Polymorphic Obfuscation", "Anti-Disassembly", "LLVM Passes"],
    activeRange: { startYear: 2021, endYear: 2026 },
    pgpFingerprint: "6677 8899 0011 2233 4455 AABB CCDD EEFF 6677 8899",
    wallets: [{ currency: "BTC", address: "bc1qciphermavenobfuscator7788" }],
    contact: { jabber: "ciphermaven@xmpp.is" },
    forums: ["Exploit.in"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-16T09:00:00Z", content: "Custom OLLVM pass for string encryption and control flow flattening with negligible binary size overhead." }]
  },
  {
    id: "ACTOR-015",
    suspectedIdentity: { name: "Ramesh Babu", location: "Visakhapatnam, Andhra Pradesh", matchedVia: "Wallet + PGP key correlation" },
    handle: "BinaryGhost99",
    category: "Scripting / RAT Reseller",
    threatLevel: "LOW",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    source: "HackForums",
    lastSeen: "2026-08-23T20:10:00Z",
    specializations: ["AsyncRAT Builds", "HVNC Setups"],
    activeRange: { startYear: 2025, endYear: 2026 },
    pgpFingerprint: "7788 9900 1122 3344 5566 AABB CCDD EEFF 7788 9900",
    wallets: [{ currency: "BTC", address: "1BinaryGhostRatReseller88371" }],
    contact: { telegram: "binary_ghost_hf" },
    forums: ["HackForums"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-19T21:00:00Z", content: "Free setup support for beginner buyers. Clean stub and hidden desktop access included." }]
  },
  {
    id: "ACTOR-016",
    suspectedIdentity: { name: "Srinivas Rao", location: "Warangal, Telangana", matchedVia: "Wallet + PGP key correlation" },
    handle: "AnarchoByte",
    category: "Hacktivism / Leaks",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    source: "DDoSecrets / Telegram",
    lastSeen: "2026-08-17T23:45:00Z",
    specializations: ["SQLi Exfiltration", "Public Dumps", "Website Defacements"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "8899 0011 2233 4455 6677 AABB CCDD EEFF 8899 0011",
    wallets: [{ currency: "BTC", address: "bc1qanarchobytedataleaks8837" }],
    contact: { tox: "990011223344556677889900AABBCCDDEEFF00112233445566778899AABBCCDD" },
    forums: ["Telegram"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-15T00:00:00Z", content: "All corporate greed will be exposed. 120GB SQL dump released on torrent mirrors." }]
  },
  {
    id: "ACTOR-017",
    suspectedIdentity: { name: "Harish Menon", location: "Kochi, Kerala", matchedVia: "Wallet + PGP key correlation" },
    handle: "QuantumLocker",
    category: "Ransomware / Extortion",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    source: "RAMP",
    lastSeen: "2026-08-21T06:15:00Z",
    specializations: ["Rust-based Encrypters", "Double Extortion"],
    activeRange: { startYear: 2025, endYear: 2026 },
    pgpFingerprint: "9900 1122 3344 5566 7788 AABB CCDD EEFF 9900 1122",
    wallets: [{ currency: "BTC", address: "bc1qquantumlockerrustcrypto77" }],
    contact: { jabber: "quantumlocker@exploit.im" },
    forums: ["RAMP"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-18T07:00:00Z", content: "High speed multi-threaded Rust locker with intermittent encryption mode. Escrow verified." }]
  },
  {
    id: "ACTOR-018",
    suspectedIdentity: { name: "Ravinder Singh", location: "Chandigarh", matchedVia: "Wallet + PGP key correlation" },
    handle: "ShadowMerchant",
    category: "Darknet Goods / Documents",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    source: "Bohemia / Dread",
    lastSeen: "2026-08-24T16:00:00Z",
    specializations: ["Physical Passports", "EU Driver Licenses", "Hologram Replicas"],
    activeRange: { startYear: 2020, endYear: 2026 },
    pgpFingerprint: "0011 2233 4455 6677 8899 AABB CCDD EEFF 0011 2233",
    wallets: [{ currency: "BTC", address: "3ShadowMerchantPassports88237" }],
    contact: { jabber: "shadowmerchant@jabb3r.de" },
    forums: ["Bohemia", "Dread"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-20T17:00:00Z", content: "Registered biometric EU passports with scannable MRZ and UV security features. Delivered globally." }]
  },
  // --- New case categories: dark money, illegal drug delivery, human trafficking,
  // cinema piracy, illegal weapons, organ trafficking. Victim/impact information is
  // kept deliberately abstract and statistical (never a personal narrative), matching
  // how real case-management systems represent this data — this protects victim
  // privacy and avoids the record itself becoming sensitive or exploitable. ---
  {
    id: "ACTOR-019",
    suspectedIdentity: { name: "Kiran Kumar", location: "Visakhapatnam, Andhra Pradesh", matchedVia: "Wallet + PGP key correlation" },
    handle: "ObsidianLedger",
    category: "Dark Money / Laundering",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&auto=format&fit=crop&q=80",
    source: "Dread / Private Telegram",
    lastSeen: "2026-08-26T10:30:00Z",
    specializations: ["Shell Company Routing", "Crypto-to-Cash Conversion", "Trade-Based Laundering"],
    activeRange: { startYear: 2022, endYear: 2026 },
    pgpFingerprint: "1A2B 3C4D 5E6F 7788 99AA BBCC DDEE FF00 1122 3344",
    wallets: [{ currency: "BTC", address: "bc1qobsidianledgerlaunder99213" }],
    contact: { jabber: "obsidianledger@exploit.im" },
    forums: ["Dread", "Private Telegram"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-22T09:00:00Z", content: "Offering layered fund routing through registered shell entities. Clean settlement, standard fee structure." }],
    caseContext: {
      caseType: "Dark Money / Financial Laundering",
      affectedRegion: "Multi-jurisdiction (EU / SE Asia)",
      estimatedCaseCount: 6,
      investigationStatus: "Under financial intelligence review",
      agencyFocus: "Financial Intelligence Unit"
    }
  },
  {
    id: "ACTOR-020",
    suspectedIdentity: { name: "Suresh Patil", location: "Nagpur, Maharashtra", matchedVia: "Wallet + PGP key correlation" },
    handle: "SwiftCourierNet",
    category: "Illegal Drug Delivery / Logistics",
    threatLevel: "HIGH",
    avatar: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=150&auto=format&fit=crop&q=80",
    source: "Bohemia Market",
    lastSeen: "2026-08-29T13:10:00Z",
    specializations: ["Stealth Packaging", "Cross-Border Courier Network", "Vacuum-Seal Concealment"],
    activeRange: { startYear: 2021, endYear: 2026 },
    pgpFingerprint: "2233 4455 6677 8899 AABB CCDD EEFF 0011 2233 4455",
    wallets: [{ currency: "XMR", address: "swiftcourier88xmrpaymentnode7123847192837461928374" }],
    contact: { tox: "22334455667788AABBCCDDEEFF0011223344556677889900AABBCCDDEEFF" },
    forums: ["Bohemia"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-27T11:00:00Z", content: "Domestic and international courier network. Tracking provided post-dispatch. Escrow accepted." }],
    caseContext: {
      caseType: "Illegal Drug Delivery Network",
      affectedRegion: "National + cross-border shipments",
      estimatedCaseCount: 14,
      investigationStatus: "Active surveillance",
      agencyFocus: "Narcotics Control Bureau"
    }
  },
  {
    id: "ACTOR-021",
    suspectedIdentity: { name: "Ramesh Naik", location: "Belgaum, Karnataka", matchedVia: "Wallet + PGP key correlation" },
    handle: "RedLanternBroker",
    category: "Human Trafficking (Women)",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=150&auto=format&fit=crop&q=80",
    source: "Restricted-access forum",
    lastSeen: "2026-08-25T02:00:00Z",
    specializations: ["Cross-Border Logistics Coordination"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "3344 5566 7788 99AA BBCC DDEE FF00 1122 3344 5566",
    wallets: [{ currency: "BTC", address: "bc1qredlanternbrokerescrow4471" }],
    contact: { jabber: "redlantern@exploit.im" },
    forums: ["Restricted-access forum"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-19T22:00:00Z", content: "[Content flagged and withheld — record retained for law-enforcement referral only.]" }],
    caseContext: {
      caseType: "Human Trafficking — Women",
      affectedRegion: "Multi-jurisdiction",
      estimatedCaseCount: 9,
      investigationStatus: "Referred to specialized anti-trafficking unit",
      agencyFocus: "Anti-Human Trafficking Unit (AHTU)"
    }
  },
  {
    id: "ACTOR-022",
    suspectedIdentity: { name: "Vamshi Rao", location: "Nizamabad, Telangana", matchedVia: "Wallet + PGP key correlation" },
    handle: "NightOwlRelay",
    category: "Child Trafficking",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=150&auto=format&fit=crop&q=80",
    source: "Restricted-access forum",
    lastSeen: "2026-08-23T05:00:00Z",
    specializations: ["Cross-Border Logistics Coordination"],
    activeRange: { startYear: 2024, endYear: 2026 },
    pgpFingerprint: "4455 6677 8899 AABB CCDD EEFF 0011 2233 4455 6677",
    wallets: [{ currency: "XMR", address: "nightowlrelayxmrescrow98234710" }],
    contact: {},
    forums: ["Restricted-access forum"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-20T04:00:00Z", content: "[Content flagged and withheld — record retained for law-enforcement referral only.]" }],
    caseContext: {
      caseType: "Child Trafficking",
      affectedRegion: "Multi-jurisdiction",
      estimatedCaseCount: 3,
      investigationStatus: "Escalated — specialized child-protection unit engaged",
      agencyFocus: "Child Protection & Anti-Trafficking Unit"
    }
  },
  {
    id: "ACTOR-023",
    suspectedIdentity: { name: "Ravi Kumar", location: "Hyderabad, Telangana", matchedVia: "Wallet + PGP key correlation" },
    handle: "ReelPirateHub",
    category: "Cinema / Media Piracy",
    threatLevel: "MEDIUM",
    avatar: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=80",
    source: "Torrent Trackers / Telegram",
    lastSeen: "2026-08-30T18:40:00Z",
    specializations: ["Cam-Rip Distribution", "OTT Credential Reselling", "Streaming Mirror Hosting"],
    activeRange: { startYear: 2020, endYear: 2026 },
    pgpFingerprint: "5566 7788 99AA BBCC DDEE FF00 1122 3344 5566 7788",
    wallets: [{ currency: "BTC", address: "bc1qreelpiratehubcamriprofit22" }],
    contact: { telegram: "reelpiratehub_leaks" },
    forums: ["Telegram"],
    infrastructure: {
      onion_address: "reelpirate9x3qj9z8m2v1p4l6w5r0t8y7u1i3o5p7a9s1d3f.onion",
      status_page_exposed: true,
      clearnet_ip_leaked: "91.203.145.22",
      ssl_cert: { sha256_fingerprint: "b3d1f2a9c8e7065d9c0114a87b32ef8a1c90234d7f5619a0bc45ef201389bbc", subject_cn: "streammirror-cdn.net" }
    },
    samplePosts: [{ timestamp: "2026-08-28T12:00:00Z", content: "New cam-rip uploaded, 1080p, dual audio. Mirror links rotated every 6 hours to avoid takedown." }],
    caseContext: {
      caseType: "Cinema / Media Piracy",
      affectedRegion: "Global distribution, India-origin uploads",
      estimatedCaseCount: 220,
      investigationStatus: "Takedown & civil action in progress",
      agencyFocus: "Anti-Piracy Cell / Industry Coalition"
    }
  },
  {
    id: "ACTOR-024",
    suspectedIdentity: { name: "Shiva Prasad", location: "Visakhapatnam, Andhra Pradesh", matchedVia: "Wallet + PGP key correlation" },
    handle: "IronCacheArmory",
    category: "Illegal Weapons",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=150&auto=format&fit=crop&q=80",
    source: "Dread / Restricted Armory Board",
    lastSeen: "2026-08-24T15:20:00Z",
    specializations: ["3D-Printed Components", "Cross-Border Arms Logistics", "Ammunition Reselling"],
    activeRange: { startYear: 2022, endYear: 2026 },
    pgpFingerprint: "6677 8899 AABB CCDD EEFF 0011 2233 4455 6677 8899",
    wallets: [{ currency: "BTC", address: "bc1qironcachearmoryescrow9012" }, { currency: "XMR", address: "ironcachexmrarmorynode837461928374619283746192" }],
    contact: { jabber: "ironcache@exploit.im", tox: "667788AABBCCDDEEFF0011223344556677889900AABBCCDDEE" },
    forums: ["Dread", "Restricted Armory Board"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-21T10:00:00Z", content: "Stock refreshed. Discreet freight, verified sellers only, no first-time direct shipping." }],
    caseContext: {
      caseType: "Illegal Weapons Trade",
      affectedRegion: "Domestic + cross-border smuggling routes",
      estimatedCaseCount: 11,
      investigationStatus: "Joint task force investigation",
      agencyFocus: "Arms & Explosives Control Unit"
    }
  },
  {
    id: "ACTOR-025",
    suspectedIdentity: { name: "Sri Ram Achari", location: "Coimbatore, Tamil Nadu", matchedVia: "Wallet + PGP key correlation" },
    handle: "VitalRouteBroker",
    category: "Human Organ Trafficking",
    threatLevel: "CRITICAL",
    avatar: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=150&auto=format&fit=crop&q=80",
    source: "Restricted-access forum",
    lastSeen: "2026-08-18T08:50:00Z",
    specializations: ["Cross-Border Medical Logistics Coordination"],
    activeRange: { startYear: 2023, endYear: 2026 },
    pgpFingerprint: "7788 99AA BBCC DDEE FF00 1122 3344 5566 7788 99AA",
    wallets: [{ currency: "XMR", address: "vitalroutebrokerxmr9823471029384" }],
    contact: { jabber: "vitalroute@exploit.im" },
    forums: ["Restricted-access forum"],
    infrastructure: null,
    samplePosts: [{ timestamp: "2026-08-15T06:00:00Z", content: "[Content flagged and withheld — record retained for law-enforcement referral only.]" }],
    caseContext: {
      caseType: "Human Organ Trafficking",
      affectedRegion: "Multi-jurisdiction",
      estimatedCaseCount: 4,
      investigationStatus: "Referred to specialized medical-crimes unit",
      agencyFocus: "Organ Trafficking & Medical Crimes Unit"
    }
  }
];
