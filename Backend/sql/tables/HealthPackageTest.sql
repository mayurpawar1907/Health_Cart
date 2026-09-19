CREATE TABLE HealthPackageTest (
  id VARCHAR(30) PRIMARY KEY,
  packageTestId VARCHAR(30) NOT NULL,
  includedTestId VARCHAR(30) NOT NULL,
  UNIQUE KEY uq_pkg_test (packageTestId, includedTestId),
  CONSTRAINT fk_hpt_pkg FOREIGN KEY (packageTestId) REFERENCES Test(id) ON DELETE CASCADE,
  CONSTRAINT fk_hpt_inc FOREIGN KEY (includedTestId) REFERENCES Test(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
