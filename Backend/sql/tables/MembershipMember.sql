CREATE TABLE MembershipMember (
  id VARCHAR(30) PRIMARY KEY,
  membershipId VARCHAR(30) NOT NULL,
  familyMemberId VARCHAR(30) NULL,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(64) NOT NULL,
  isPrimary TINYINT(1) NOT NULL DEFAULT 0,
  INDEX (membershipId),
  CONSTRAINT fk_mm_mem FOREIGN KEY (membershipId) REFERENCES Membership(id) ON DELETE CASCADE,
  CONSTRAINT fk_mm_fam FOREIGN KEY (familyMemberId) REFERENCES FamilyMember(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
