  -- --- ENUMS ---

  CREATE TYPE user_role AS ENUM (
    'user',
    'mentor',
    'admin'
  );

  CREATE TYPE account_status AS ENUM (
    'unverified',
    'active',
    'inactive'
  );

  CREATE TYPE gender AS ENUM (
    'male',
    'female'
  );

  CREATE TYPE acc_user_type AS ENUM (
    'student',
    'working'
  );

  CREATE TYPE approval_status AS ENUM (
    'pending',
    'approved',
    'rejected'
  );

  CREATE TYPE booking_status AS ENUM (
    'pending',       -- Created
    'accepted',      -- Mentor confirmed
    'rejected',      -- Mentor rejected
    'cancelled',     -- Only student can cancel
    'completed',     -- Mentor marks finished
    'incompleted'    -- Mentor marks incomplete
  );

  CREATE TYPE payment_method AS ENUM (
    'cash',
    'card'
  );

  CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid'
  );

  CREATE TYPE document_type AS ENUM (
    'cv',
    'portfolio',
    'certificate'
  );



ALTER TABLE Users
ADD COLUMN created_by uuid;

ALTER TABLE Users
ADD CONSTRAINT fk_users_created_by
FOREIGN KEY (created_by) REFERENCES Users (id);
  -- --- TABLES ---

  CREATE TABLE Users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    password text NOT NULL,
    role_name user_role NOT NULL,
    status account_status NOT NULL DEFAULT 'unverified',
    email_verified_at timestamptz,
    created_at timestamptz DEFAULT now(), 
    updated_at timestamptz DEFAULT now(),
    last_login timestamptz,
    last_password_change timestamptz,
    deleted_at timestamptz,
    created_by uuid,
  );

  -- Index for login/lookup
  CREATE UNIQUE INDEX idx_users_email ON Users (email);
  CREATE INDEX idx_users_role_name ON Users (role_name);
  CREATE INDEX idx_users_status ON Users (status);

  CREATE TABLE Admin (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    full_name varchar(255),
    phone varchar(50),
    profile_image text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_admin_user_id ON Admin (user_id);

  CREATE TABLE Industry (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_name varchar(255) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE TABLE Position (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id uuid NOT NULL,
    position_name varchar(255) UNIQUE NOT NULL,
    image_position varchar(255),
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE TABLE Mentor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    gender gender NOT NULL,
    dob date NOT NULL,
    phone varchar(50) NOT NULL,
    position_id uuid NOT NULL,
    industry_id uuid NOT NULL,
    job_title varchar(255) NOT NULL,
    expertise_areas text,
    experience_years int,
    company_name varchar(255),
    social_media varchar(255),
    about_mentor text,
    profile_image varchar(255),
    approval_status approval_status NOT NULL DEFAULT 'pending',
    approved_by uuid,
    approved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_mentor_approval_status ON Mentor (approval_status);
  CREATE INDEX idx_mentor_position_id ON Mentor (position_id);
  CREATE INDEX idx_mentor_industry_id ON Mentor (industry_id);
  CREATE INDEX idx_mentor_user_id ON Mentor (user_id);

  CREATE TABLE Mentor_Documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id uuid NOT NULL,
    document_type document_type NOT NULL DEFAULT 'cv',
    document_url text NOT NULL,
    is_primary_cv boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_mentor_documents_mentor_id ON Mentor_Documents (mentor_id);

  CREATE TABLE Mentor_Education (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id uuid NOT NULL,
    university_name varchar(255) NOT NULL,
    degree_name varchar(255) NOT NULL,
    field_of_study varchar(255),
    year_graduated int NOT NULL,
    grade_gpa varchar(10),
    activities text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_mentor_education_mentor_id ON Mentor_Education (mentor_id);

  CREATE TABLE Acc_User (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    phone varchar(20) NOT NULL,
    gender gender NOT NULL,
    dob date NOT NULL,
    types_user acc_user_type NOT NULL,
    institution_name varchar(255) NOT NULL,
    profile_image varchar(255) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_acc_user_user_id ON Acc_User (user_id);

  CREATE TABLE Session (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id uuid NOT NULL,
    position_id uuid NOT NULL,
    price decimal(10,2) NOT NULL,
    agenda_pdf varchar(255),
    location_name varchar(255) NOT NULL,
    location_map_url text NOT NULL, 
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_session_mentor_id ON Session (mentor_id);
  CREATE INDEX idx_session_position_id ON Session (position_id);
  CREATE INDEX idx_session_is_available ON Session (is_available);

  CREATE TABLE Schedule_Timeslot (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    mentor_id uuid NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    booking_id uuid UNIQUE,           -- 1:1 with Booking
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_timeslot_calendar ON Schedule_Timeslot (mentor_id, start_date);
  CREATE INDEX idx_schedule_timeslot_session_id ON Schedule_Timeslot (session_id);
  CREATE INDEX idx_schedule_timeslot_booking_id ON Schedule_Timeslot (booking_id);

  CREATE TABLE Booking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_timeslot_id uuid UNIQUE NOT NULL,
    mentor_id uuid NOT NULL,
    acc_user_id uuid NOT NULL,
    position_id uuid NOT NULL,
    session_id uuid NOT NULL,
    mentor_name_snapshot varchar(255) NOT NULL,
    acc_user_name_snapshot varchar(255) NOT NULL,
    position_name_snapshot varchar(255) NOT NULL,
    session_price_snapshot decimal(10,2) NOT NULL,
    start_date_snapshot timestamptz NOT NULL,
    end_date_snapshot timestamptz NOT NULL,
    total_amount decimal(10,2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    cancelled_by uuid,   -- only student
    updated_by uuid,   -- mentor for most changes
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz
  );

  CREATE INDEX idx_booking_mentor_id ON Booking (mentor_id);
  CREATE INDEX idx_booking_acc_user_id ON Booking (acc_user_id);
  CREATE INDEX idx_booking_status ON Booking (status);
  CREATE INDEX idx_booking_created_at ON Booking (created_at);
  CREATE INDEX idx_booking_schedule_timeslot_id ON Booking (schedule_timeslot_id);
  CREATE INDEX idx_booking_session_id ON Booking (session_id);

  CREATE TABLE Payment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL,
    method payment_method NOT NULL,
    amount decimal(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id varchar(255),
    pay_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE INDEX idx_payment_booking_id ON Payment (booking_id);
  CREATE INDEX idx_payment_status ON Payment (status);

  CREATE TABLE Invoice (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id uuid NOT NULL,
    mentor_id uuid NOT NULL,
    acc_user_id uuid NOT NULL,
    position_id uuid NOT NULL,
    total_amount decimal(10,2) NOT NULL,
    mentor_name_snapshot varchar(255) NOT NULL,
    mentor_position_snapshot varchar(255) NOT NULL,
    acc_user_name_snapshot varchar(255) NOT NULL,
    start_date_snapshot timestamptz NOT NULL,
    end_date_snapshot timestamptz NOT NULL,
    session_price_snapshot decimal(10,2) NOT NULL,
    payment_method_snapshot payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE INDEX idx_invoice_payment_id ON Invoice (payment_id);
  CREATE INDEX idx_invoice_mentor_id ON Invoice (mentor_id);
  CREATE INDEX idx_invoice_acc_user_id ON Invoice (acc_user_id);

  CREATE TABLE Certificate (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL,
    position_id uuid NOT NULL,
    acc_user_id uuid NOT NULL,
    mentor_id uuid NOT NULL,
    mentor_name_snapshot varchar(255) NOT NULL,
    position_name_snapshot varchar(255) NOT NULL,
    issue_date date NOT NULL,
    certificate_number varchar(100) UNIQUE NOT NULL,
    issued_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  CREATE UNIQUE INDEX idx_certificate_number ON Certificate (certificate_number);
  CREATE INDEX idx_certificate_acc_user_id ON Certificate (acc_user_id);
  CREATE INDEX idx_certificate_mentor_id ON Certificate (mentor_id);
  CREATE INDEX idx_certificate_booking_id ON Certificate (booking_id);


  ALTER TABLE Login_Session
  ADD CONSTRAINT login_session_user_id_unique UNIQUE (user_id);

  -- --- NEW TABLES ADDED ---

  CREATE TABLE Login_Session (
    
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    row_num serial UNIQUE,
    user_id uuid NOT NULL,
    refresh_token text NOT NULL,
    access_token text NOT NULL,
    created_at timestamptz DEFAULT now(),
    expired_at timestamptz,
    device_info text
  );



  CREATE INDEX idx_login_session_user_id ON Login_Session (user_id);
  CREATE INDEX idx_login_session_refresh_token ON Login_Session (refresh_token);

  CREATE TABLE Password_Reset (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    row_num serial UNIQUE,
    user_id uuid NOT NULL,
    reset_token text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz
  );

  CREATE INDEX idx_password_reset_user_id ON Password_Reset (user_id);
  CREATE UNIQUE INDEX idx_password_reset_reset_token ON Password_Reset (reset_token);

  -- --- FOREIGN KEYS ---

  ALTER TABLE Admin ADD CONSTRAINT fk_admin_user_id
    FOREIGN KEY (user_id) REFERENCES Users (id);

  ALTER TABLE Mentor ADD CONSTRAINT fk_mentor_user_id
    FOREIGN KEY (user_id) REFERENCES Users (id);

  ALTER TABLE Acc_User ADD CONSTRAINT fk_acc_user_user_id
    FOREIGN KEY (user_id) REFERENCES Users (id);

  ALTER TABLE Login_Session ADD CONSTRAINT fk_login_session_user_id
    FOREIGN KEY (user_id) REFERENCES Users (id);

  ALTER TABLE Password_Reset ADD CONSTRAINT fk_password_reset_user_id
    FOREIGN KEY (user_id) REFERENCES Users (id);

  ALTER TABLE Position ADD CONSTRAINT fk_position_industry_id
    FOREIGN KEY (industry_id) REFERENCES Industry (id);

  ALTER TABLE Mentor ADD CONSTRAINT fk_mentor_position_id
    FOREIGN KEY (position_id) REFERENCES Position (id);

  ALTER TABLE Mentor ADD CONSTRAINT fk_mentor_industry_id
    FOREIGN KEY (industry_id) REFERENCES Industry (id);

  ALTER TABLE Session ADD CONSTRAINT fk_session_position_id
    FOREIGN KEY (position_id) REFERENCES Position (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_position_id
    FOREIGN KEY (position_id) REFERENCES Position (id);

  ALTER TABLE Invoice ADD CONSTRAINT fk_invoice_position_id -- Assuming Invoice contains position_id for snapshot context
    FOREIGN KEY (position_id) REFERENCES Position (id);

  ALTER TABLE Certificate ADD CONSTRAINT fk_certificate_position_id
    FOREIGN KEY (position_id) REFERENCES Position (id);

  ALTER TABLE Session ADD CONSTRAINT fk_session_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Schedule_Timeslot ADD CONSTRAINT fk_timeslot_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Certificate ADD CONSTRAINT fk_certificate_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Certificate ADD CONSTRAINT fk_certificate_issued_by
    FOREIGN KEY (issued_by) REFERENCES Mentor (id);

  ALTER TABLE Mentor_Documents ADD CONSTRAINT fk_mentor_documents_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Mentor_Education ADD CONSTRAINT fk_mentor_education_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Session ADD CONSTRAINT fk_session_mentor_id_ref
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Schedule_Timeslot ADD CONSTRAINT fk_timeslot_session_id
    FOREIGN KEY (session_id) REFERENCES Session (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_session_id
    FOREIGN KEY (session_id) REFERENCES Session (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_timeslot_id
    FOREIGN KEY (schedule_timeslot_id) REFERENCES Schedule_Timeslot (id);

  ALTER TABLE Schedule_Timeslot ADD CONSTRAINT fk_timeslot_booking_id
    FOREIGN KEY (booking_id) REFERENCES Booking (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_acc_user_id
    FOREIGN KEY (acc_user_id) REFERENCES Acc_User (id);

  ALTER TABLE Booking ADD CONSTRAINT fk_booking_cancelled_by
    FOREIGN KEY (cancelled_by) REFERENCES Acc_User (id);

  ALTER TABLE Payment ADD CONSTRAINT fk_payment_booking_id
    FOREIGN KEY (booking_id) REFERENCES Booking (id);

  ALTER TABLE Invoice ADD CONSTRAINT fk_invoice_payment_id
    FOREIGN KEY (payment_id) REFERENCES Payment (id);

  ALTER TABLE Certificate ADD CONSTRAINT fk_certificate_booking_id
    FOREIGN KEY (booking_id) REFERENCES Booking (id);

  ALTER TABLE Mentor ADD CONSTRAINT fk_mentor_approved_by
    FOREIGN KEY (approved_by) REFERENCES Admin (id);

  -- Additional FKs derived from Invoice/Certificate snapshots to actual entities for referential integrity/reporting
  ALTER TABLE Invoice ADD CONSTRAINT fk_invoice_mentor_id
    FOREIGN KEY (mentor_id) REFERENCES Mentor (id);

  ALTER TABLE Invoice ADD CONSTRAINT fk_invoice_acc_user_id
    FOREIGN KEY (acc_user_id) REFERENCES Acc_User (id);
