--
-- PostgreSQL database dump
--

\restrict zNEJqCp8t1P3PW4VQTE0snjlRznaC7NFMXzlUglXo9NCbIc3T0b42yqoall4nUy

-- Dumped from database version 17.11 (Debian 17.11-1.pgdg13+2)
-- Dumped by pg_dump version 17.11 (Debian 17.11-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: InfrastructureStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."InfrastructureStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'REPAIR',
    'BROKEN',
    'WRITTEN_OFF'
);


ALTER TYPE public."InfrastructureStatus" OWNER TO prorabotka;

--
-- Name: InfrastructureType; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."InfrastructureType" AS ENUM (
    'ROOM',
    'EQUIPMENT'
);


ALTER TYPE public."InfrastructureType" OWNER TO prorabotka;

--
-- Name: LanguageLevel; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."LanguageLevel" AS ENUM (
    'BASIC',
    'INTERMEDIATE',
    'ADVANCED',
    'FLUENT',
    'NATIVE'
);


ALTER TYPE public."LanguageLevel" OWNER TO prorabotka;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'REPLIED',
    'FOLLOW_UP',
    'MEETING_PLANNED',
    'INTERESTED',
    'NOT_INTERESTED',
    'NO_RESPONSE'
);


ALTER TYPE public."LeadStatus" OWNER TO prorabotka;

--
-- Name: QuarterStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."QuarterStatus" AS ENUM (
    'NOT_STARTED',
    'WAITING',
    'RECEIVED',
    'CHECKED',
    'MISSING'
);


ALTER TYPE public."QuarterStatus" OWNER TO prorabotka;

--
-- Name: ResidentStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."ResidentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'ARCHIVED'
);


ALTER TYPE public."ResidentStatus" OWNER TO prorabotka;

--
-- Name: SectionType; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."SectionType" AS ENUM (
    'STARTUPS',
    'RESIDENTS',
    'INFRASTRUCTURE',
    'GENERAL',
    'TALENTS'
);


ALTER TYPE public."SectionType" OWNER TO prorabotka;

--
-- Name: StartupFundingType; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."StartupFundingType" AS ENUM (
    'INVESTMENT',
    'GRANT'
);


ALTER TYPE public."StartupFundingType" OWNER TO prorabotka;

--
-- Name: StartupStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."StartupStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'ARCHIVED'
);


ALTER TYPE public."StartupStatus" OWNER TO prorabotka;

--
-- Name: TalentStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."TalentStatus" AS ENUM (
    'AVAILABLE',
    'OPEN_TO_OFFERS',
    'EMPLOYED',
    'NOT_AVAILABLE'
);


ALTER TYPE public."TalentStatus" OWNER TO prorabotka;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO prorabotka;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE'
);


ALTER TYPE public."TaskStatus" OWNER TO prorabotka;

--
-- Name: UserApprovalStatus; Type: TYPE; Schema: public; Owner: prorabotka
--

CREATE TYPE public."UserApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."UserApprovalStatus" OWNER TO prorabotka;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ActivityLog; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."ActivityLog" (
    id text NOT NULL,
    action text NOT NULL,
    "entityType" text NOT NULL,
    "entityId" text,
    description text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ActivityLog" OWNER TO prorabotka;

--
-- Name: Document; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Document" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "originalName" text,
    "fileUrl" text NOT NULL,
    "mimeType" text,
    "fileSize" integer,
    description text,
    section public."SectionType" NOT NULL,
    "uploadedById" text NOT NULL,
    "spaceId" text,
    "folderId" text,
    "startupId" text,
    "residentId" text,
    "infrastructureId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "storageKey" text NOT NULL,
    "talentId" text
);


ALTER TABLE public."Document" OWNER TO prorabotka;

--
-- Name: Folder; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Folder" (
    id text NOT NULL,
    name text NOT NULL,
    "spaceId" text NOT NULL,
    "parentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Folder" OWNER TO prorabotka;

--
-- Name: Infrastructure; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Infrastructure" (
    id text NOT NULL,
    name text NOT NULL,
    type public."InfrastructureType" NOT NULL,
    status public."InfrastructureStatus" DEFAULT 'AVAILABLE'::public."InfrastructureStatus" NOT NULL,
    "roomNumber" text,
    "inventoryNo" text,
    description text,
    location text,
    quantity integer DEFAULT 1 NOT NULL,
    "residentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    capacity integer
);


ALTER TABLE public."Infrastructure" OWNER TO prorabotka;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "companyName" text NOT NULL,
    country text NOT NULL,
    city text,
    industry text,
    website text,
    "companyLinkedIn" text,
    "contactName" text,
    "contactPosition" text,
    "contactEmail" text,
    "contactPhone" text,
    "contactLinkedIn" text,
    source text,
    channel text,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "lastContactAt" timestamp(3) without time zone,
    "nextFollowUpAt" timestamp(3) without time zone,
    notes text,
    "campaignId" text,
    "ownerId" text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lead" OWNER TO prorabotka;

--
-- Name: OutreachCampaign; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."OutreachCampaign" (
    id text NOT NULL,
    name text NOT NULL,
    country text NOT NULL,
    city text,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "targetSectors" text,
    description text,
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OutreachCampaign" OWNER TO prorabotka;

--
-- Name: QuarterReport; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."QuarterReport" (
    id text NOT NULL,
    year integer NOT NULL,
    quarter integer NOT NULL,
    status public."QuarterStatus" DEFAULT 'NOT_STARTED'::public."QuarterStatus" NOT NULL,
    "receivedAt" timestamp(3) without time zone,
    "checkedAt" timestamp(3) without time zone,
    notes text,
    "residentId" text NOT NULL,
    "documentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."QuarterReport" OWNER TO prorabotka;

--
-- Name: Resident; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Resident" (
    id text NOT NULL,
    "companyName" text NOT NULL,
    tin text,
    activity text,
    exporter boolean DEFAULT false NOT NULL,
    "founderCountry" text,
    region text,
    district text,
    "residentSince" timestamp(3) without time zone,
    "focalPoint" text,
    "broughtBy" text,
    status public."ResidentStatus" DEFAULT 'ACTIVE'::public."ResidentStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Resident" OWNER TO prorabotka;

--
-- Name: Space; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Space" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    section public."SectionType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Space" OWNER TO prorabotka;

--
-- Name: Startup; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Startup" (
    id text NOT NULL,
    name text NOT NULL,
    "founderName" text,
    phone text,
    email text,
    stage text,
    status public."StartupStatus" DEFAULT 'ACTIVE'::public."StartupStatus" NOT NULL,
    "joinedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "logoUrl" text
);


ALTER TABLE public."Startup" OWNER TO prorabotka;

--
-- Name: StartupFunding; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."StartupFunding" (
    id text NOT NULL,
    "startupId" text NOT NULL,
    type public."StartupFundingType" NOT NULL,
    amount numeric(65,30),
    currency text,
    source text,
    round text,
    "fundedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."StartupFunding" OWNER TO prorabotka;

--
-- Name: Talent; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Talent" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    "position" text,
    phone text,
    email text,
    telegram text,
    location text,
    "currentCompany" text,
    "experienceYears" integer,
    "salaryExpectation" numeric(65,30),
    "salaryCurrency" text,
    status public."TalentStatus" DEFAULT 'AVAILABLE'::public."TalentStatus" NOT NULL,
    "linkedinUrl" text,
    "githubUrl" text,
    "portfolioUrl" text,
    "photoUrl" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Talent" OWNER TO prorabotka;

--
-- Name: TalentLanguage; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."TalentLanguage" (
    id text NOT NULL,
    language text NOT NULL,
    level public."LanguageLevel" NOT NULL,
    "talentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TalentLanguage" OWNER TO prorabotka;

--
-- Name: TalentSkill; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."TalentSkill" (
    id text NOT NULL,
    name text NOT NULL,
    "talentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TalentSkill" OWNER TO prorabotka;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'TODO'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "creatorId" text NOT NULL,
    "assigneeId" text,
    "startupId" text,
    "residentId" text,
    "infrastructureId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Task" OWNER TO prorabotka;

--
-- Name: TaskAttachment; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."TaskAttachment" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileSize" integer,
    "taskId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TaskAttachment" OWNER TO prorabotka;

--
-- Name: TaskComment; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."TaskComment" (
    id text NOT NULL,
    content text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TaskComment" OWNER TO prorabotka;

--
-- Name: User; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "position" text,
    "approvalStatus" public."UserApprovalStatus" DEFAULT 'APPROVED'::public."UserApprovalStatus" NOT NULL,
    role text,
    surname text
);


ALTER TABLE public."User" OWNER TO prorabotka;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: prorabotka
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO prorabotka;

--
-- Data for Name: ActivityLog; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."ActivityLog" (id, action, "entityType", "entityId", description, "userId", "createdAt") FROM stdin;
cmv4s0flf0001a5lwxby97drk	TASK_CREATED	TASK	cmv4s0fl80000a5lwgg17n16v	created this task	cmuzes3vc0000xtla8wbqchdd	2026-10-12 04:52:56.691
cmv4stgdg000ha5lwkynhqzkn	TASK_CREATED	TASK	cmv4stgda000ga5lwd8ngsgnt	created this task	cmv2bp4vp0003rola7do43qov	2026-10-12 05:15:30.724
cmv4sw6kw000ja5lwem8gevtc	TASK_CREATED	TASK	cmv4sw6kq000ia5lwiq64whyj	created this task	cmv2bp4vp0003rola7do43qov	2026-10-12 05:17:38
cmv4sxp3p000la5lwohbykred	TASK_CREATED	TASK	cmv4sxp3h000ka5lwbq4xjugo	created this task	cmv2bp4vp0003rola7do43qov	2026-10-12 05:18:48.661
cmv4szqhe000na5lwwbo9erfz	TASK_CREATED	TASK	cmv4szqh8000ma5lwqekf32ug	created this task	cmv2bp4vp0003rola7do43qov	2026-10-12 05:20:23.762
cmv4szu2k000pa5lwvxfrfz5v	TASK_CREATED	TASK	cmv4szu2e000oa5lwpcmfycfx	created this task	cmuzes3vc0000xtla8wbqchdd	2026-10-12 05:20:28.412
cmv4t09y2000qa5lw9zcymxya	ASSIGNEE_CHANGED	TASK	cmv4sxp3h000ka5lwbq4xjugo	changed assignee from Ali Farhodov to Axror Narzullayev	cmv2bp4vp0003rola7do43qov	2026-10-12 05:20:48.986
cmv4t665k000sa5lwskr3f2w3	COMMENT_ADDED	TASK	cmv4szqh8000ma5lwqekf32ug	added a comment	cmuzes3vc0000xtla8wbqchdd	2026-10-12 05:25:24.008
cmv4t6tah000ua5lwgo04qkqu	COMMENT_ADDED	TASK	cmv4szqh8000ma5lwqekf32ug	added a comment	cmv2bp4vp0003rola7do43qov	2026-10-12 05:25:53.993
cmvhmjcxh000048laq0izdx1t	STATUS_CHANGED	TASK	cmv4sw6kq000ia5lwiq64whyj	moved this task from In progress to Done	cmv2bp4vp0003rola7do43qov	2026-10-21 04:40:42.293
cmvhmjnkp000148laihv6zlo9	STATUS_CHANGED	TASK	cmv4szqh8000ma5lwqekf32ug	moved this task from To do to Done	cmv2bp4vp0003rola7do43qov	2026-10-21 04:40:56.089
cmvhmjxzl000248lamiisws02	STATUS_CHANGED	TASK	cmv4sxp3h000ka5lwbq4xjugo	moved this task from To do to In progress	cmv2bp4vp0003rola7do43qov	2026-10-21 04:41:09.585
cmvhnjjq10006rolaa14i4ozw	TASK_CREATED	TASK	cmvhnjjpt0005rola8gl4ct2l	created this task	cmuuxfsjg0000j0laygff2joj	2026-10-21 05:08:50.713
cmvho1gn00001zgla8mwvkdf9	TASK_CREATED	TASK	cmvho1gmv0000zglasnsk05ci	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:22:46.524
cmvho314z0003zglajd6gikgm	TASK_CREATED	TASK	cmvho314u0002zglaehpygmnw	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:23:59.747
cmvho5oyk0005zgla2kw5hv2c	TASK_CREATED	TASK	cmvho5oyf0004zglalqo0efee	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:26:03.932
cmvho6ygn0007zgla53yisvyy	TASK_CREATED	TASK	cmvho6ygj0006zglaqrd5bwqi	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:27:02.903
cmvho860h0009zglagy3y792z	TASK_CREATED	TASK	cmvho860d0008zglaasaeggd8	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:27:59.345
cmvho9m59000bzglatqarc9z8	TASK_CREATED	TASK	cmvho9m54000azglaa7sgla7a	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:29:06.909
cmvhoauy0000dzgla0t2970gk	TASK_CREATED	TASK	cmvhoauxt000czgla0ws2h3lz	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:30:04.968
cmvhocjgp000fzglacsytna58	TASK_CREATED	TASK	cmvhocjgj000ezgla8wlcxb2a	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:31:23.401
cmvhodiut000hzglakf7e27yp	TASK_CREATED	TASK	cmvhodiuo000gzglanjr55r09	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:32:09.269
cmvhoerq1000jzgla9wmvzzng	TASK_CREATED	TASK	cmvhoerpw000izgla5cgpbz4i	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:33:07.417
cmvhofvji000lzglaqnk8xczm	TASK_CREATED	TASK	cmvhofvjf000kzgla66up2cpe	created this task	cmv2bodmw0002rolahmsodadr	2026-10-21 05:33:59.022
\.


--
-- Data for Name: Document; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Document" (id, "fileName", "originalName", "fileUrl", "mimeType", "fileSize", description, section, "uploadedById", "spaceId", "folderId", "startupId", "residentId", "infrastructureId", "createdAt", "updatedAt", "storageKey", "talentId") FROM stdin;
cmv4skbkk0008a5lwkrhabkd3	8d6067f8-7588-4326-a22c-102459d96026.pdf	Shartnoma - AlMubarak (100ming USD).pdf	/documents/download/8d6067f8-7588-4326-a22c-102459d96026.pdf	application/pdf	2710984	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sjtvj0007a5lwbcywp0p0	\N	\N	\N	\N	2026-10-12 05:08:24.596	2026-10-12 05:08:24.596	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/8d6067f8-7588-4326-a22c-102459d96026.pdf	\N
cmv4skjfo0009a5lwan0yjokr	fd9b947e-bfcb-46bb-a561-b55591eb0d08.pdf	Qo'shimcha kelishuv - ALMubarak - 50ming USD.pdf	/documents/download/fd9b947e-bfcb-46bb-a561-b55591eb0d08.pdf	application/pdf	7861038	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sjtvj0007a5lwbcywp0p0	\N	\N	\N	\N	2026-10-12 05:08:34.788	2026-10-12 05:08:34.788	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/fd9b947e-bfcb-46bb-a561-b55591eb0d08.pdf	\N
cmv4smw67000ca5lwrtg9jzdb	a30d9e6e-abc7-4269-ae85-dcbac3187b1d.pdf	business-plans-application-5997.pdf	/documents/download/a30d9e6e-abc7-4269-ae85-dcbac3187b1d.pdf	application/pdf	918719	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sl4hz000aa5lw4d4it00v	\N	\N	\N	\N	2026-10-12 05:10:24.607	2026-10-12 05:10:24.607	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/a30d9e6e-abc7-4269-ae85-dcbac3187b1d.pdf	\N
cmv4sn3w1000da5lwqe0khrc5	ab28938e-f6b0-4b96-ab19-0606ad6ed945.docx	Ð¢Ð°ÑÑÐ¸ÑÑÐ¸Ð»Ð°Ñ Ð¹Ð¸Ð³Ð¸Ð»Ð¸Ñ Ð±Ð°ÑÐ½Ð¸.docx	/documents/download/ab28938e-f6b0-4b96-ab19-0606ad6ed945.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	22810	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sl4hz000aa5lw4d4it00v	\N	\N	\N	\N	2026-10-12 05:10:34.609	2026-10-12 05:10:34.609	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/ab28938e-f6b0-4b96-ab19-0606ad6ed945.docx	\N
cmv4spwwc000ea5lwf017a5mp	9e589b12-f099-4d6a-80a9-3aab0cc82757.docx	ÐÑÐ¹ÑÑÐº  Ð¸ÑÐ³Ð° Ð¾Ð»Ð¸Ñ.docx	/documents/download/9e589b12-f099-4d6a-80a9-3aab0cc82757.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	26002	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sl4hz000aa5lw4d4it00v	\N	\N	\N	\N	2026-10-12 05:12:45.516	2026-10-12 05:12:45.516	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/9e589b12-f099-4d6a-80a9-3aab0cc82757.docx	\N
cmv4sq5j5000fa5lwsf7ykg39	ee3eaed0-d035-42a8-a5fa-601fbaff4d5c.xlsx	Ð¡Ð¼ÐµÑÐ° 2026.xlsx	/documents/download/ee3eaed0-d035-42a8-a5fa-601fbaff4d5c.xlsx	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	12099	\N	RESIDENTS	cmv2bp4vp0003rola7do43qov	cmv4sl4hz000aa5lw4d4it00v	\N	\N	\N	\N	2026-10-12 05:12:56.705	2026-10-12 05:12:56.705	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/ee3eaed0-d035-42a8-a5fa-601fbaff4d5c.xlsx	\N
cmvhnh8qz0004rolakiji2ixr	9019b5be-faf8-4c3b-8680-d2f04effdcba.xlsx	talents-2026-10-21.xlsx	/documents/download/9019b5be-faf8-4c3b-8680-d2f04effdcba.xlsx	application/vnd.openxmlformats-officedocument.spreadsheetml.sheet	7162	\N	TALENTS	cmuuxfsjg0000j0laygff2joj	\N	\N	\N	\N	\N	2026-10-21 05:07:03.179	2026-10-21 05:07:03.179	/Users/alifarhodov/Capones/ProRabotka/apps/api/storage/documents/9019b5be-faf8-4c3b-8680-d2f04effdcba.xlsx	cmvhn58ve0001rolageai5efp
\.


--
-- Data for Name: Folder; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Folder" (id, name, "spaceId", "parentId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Infrastructure; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Infrastructure" (id, name, type, status, "roomNumber", "inventoryNo", description, location, quantity, "residentId", "createdAt", "updatedAt", capacity) FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Lead" (id, "companyName", country, city, industry, website, "companyLinkedIn", "contactName", "contactPosition", "contactEmail", "contactPhone", "contactLinkedIn", source, channel, status, "lastContactAt", "nextFollowUpAt", notes, "campaignId", "ownerId", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OutreachCampaign; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."OutreachCampaign" (id, name, country, city, "startDate", "endDate", "targetSectors", description, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: QuarterReport; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."QuarterReport" (id, year, quarter, status, "receivedAt", "checkedAt", notes, "residentId", "documentId", "createdAt", "updatedAt") FROM stdin;
cmv2d5cr30007rolatewctyxh	2026	1	NOT_STARTED	\N	\N	\N	cmv27o7bt0000rola5e5r1jpd	\N	2026-10-10 12:21:19.695	2026-10-10 12:21:29.275
\.


--
-- Data for Name: Resident; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Resident" (id, "companyName", tin, activity, exporter, "founderCountry", region, district, "residentSince", "focalPoint", "broughtBy", status, notes, "createdAt", "updatedAt") FROM stdin;
cmv27o7bt0000rola5e5r1jpd	«VOICE DYNAMIC» MCHJ	308503214	BPO	t	O'zbekiston	Sirdaryo	Mirzaobod tumani	2022-01-31 00:00:00	Kimdur	\N	ACTIVE	\N	2026-10-10 09:48:01.433	2026-10-12 05:29:34.476
\.


--
-- Data for Name: Space; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Space" (id, name, description, section, "createdAt", "updatedAt") FROM stdin;
cmuwpqm8l0002ddla1pgia7qh	Startups	\N	STARTUPS	2026-10-06 13:27:10.101	2026-10-06 13:27:10.101
cmv4sjtvj0007a5lwbcywp0p0	AL-Mubarak	Shartnomalar	RESIDENTS	2026-10-12 05:08:01.663	2026-10-12 05:08:01.663
cmv4sl4hz000aa5lw4d4it00v	Humovoices (Zero Risk)	Hujjatlar	RESIDENTS	2026-10-12 05:09:02.087	2026-10-12 05:09:02.087
\.


--
-- Data for Name: Startup; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Startup" (id, name, "founderName", phone, email, stage, status, "joinedAt", notes, "createdAt", "updatedAt", "logoUrl") FROM stdin;
cmv2f82ct0000hklarqggpo0d	Nikohapp	Startup	999999999	asd@gm.com	MVP	ACTIVE	2002-12-22 00:00:00	\N	2026-10-10 13:19:25.421	2026-10-10 13:20:07.801	/startup-logos/1791638407781-271132972.png
\.


--
-- Data for Name: StartupFunding; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."StartupFunding" (id, "startupId", type, amount, currency, source, round, "fundedAt", notes, "createdAt", "updatedAt") FROM stdin;
cmv2f9gmt0001hklaj37yhfhn	cmv2f82ct0000hklarqggpo0d	INVESTMENT	12000.000000000000000000000000000000	USD	Angel	Seed	2026-02-12 00:00:00	\N	2026-10-10 13:20:30.581	2026-10-10 13:20:30.581
\.


--
-- Data for Name: Talent; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Talent" (id, "fullName", "position", phone, email, telegram, location, "currentCompany", "experienceYears", "salaryExpectation", "salaryCurrency", status, "linkedinUrl", "githubUrl", "portfolioUrl", "photoUrl", notes, "createdAt", "updatedAt") FROM stdin;
cmvhn4zt80000rolauhxqr6y8	Sardor Rahimov	\N	\N	\N	\N	\N	\N	\N	\N	USD	AVAILABLE	\N	\N	\N	\N	\N	2026-10-21 04:57:31.724	2026-10-21 04:57:31.724
cmvhn58ve0001rolageai5efp	Dalbek	\N	\N	\N	\N	\N	\N	\N	\N	USD	AVAILABLE	\N	\N	\N	\N	\N	2026-10-21 04:57:43.466	2026-10-21 04:57:43.466
cmvhn5cpf0002rolalnkzo73h	johny	gay	\N	\N	\N	\N	\N	\N	\N	USD	AVAILABLE	\N	\N	\N	/talent-photos/9bf8c050-4656-4565-9a90-821affde1b54.png	\N	2026-10-21 04:57:48.436	2026-10-21 05:02:36.019
\.


--
-- Data for Name: TalentLanguage; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."TalentLanguage" (id, language, level, "talentId", "createdAt") FROM stdin;
cmvhngtal0003rolacav5g7dv	Gay	BASIC	cmvhn5cpf0002rolalnkzo73h	2026-10-21 05:06:43.149
\.


--
-- Data for Name: TalentSkill; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."TalentSkill" (id, name, "talentId", "createdAt") FROM stdin;
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."Task" (id, title, description, status, priority, "dueDate", "completedAt", "creatorId", "assigneeId", "startupId", "residentId", "infrastructureId", "createdAt", "updatedAt") FROM stdin;
cmv4sxp3h000ka5lwbq4xjugo	Surhandaryolik Startap	Rezidentlikga topshirish kerak!	IN_PROGRESS	MEDIUM	2026-10-14 00:00:00	\N	cmv2bp4vp0003rola7do43qov	cmv2bp4vp0003rola7do43qov	\N	\N	\N	2026-10-12 05:18:48.654	2026-10-21 04:41:09.578
cmvhnjjpt0005rola8gl4ct2l	Крилча тест	как это	TODO	MEDIUM	\N	\N	cmuuxfsjg0000j0laygff2joj	\N	\N	\N	\N	2026-10-21 05:08:50.705	2026-10-21 05:08:50.705
cmvho1gmv0000zglasnsk05ci	Ofislar arendasi bazasi	Guliston shahrida ijaraga beriladigan ofislarni topish va bazasini yaratish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:22:46.519	2026-10-21 05:22:46.519
cmvho314u0002zglaehpygmnw	Kadrlar bazasini yaratish	Universitetlar va o'quv markazlaridan yaxshi kadrlar haqida ma'lumot olish va bazasini yaratish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:23:59.742	2026-10-21 05:23:59.742
cmvho5oyf0004zglalqo0efee	Soft Call (Vohid) ning Sardoba va Xovosdagi ofislari	Rus tilida gaplashuvchi kadrlarni topish, ofislar ahvolini tekshirish, Mirjalol va Adham bilan gaplashish	TODO	HIGH	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:26:03.927	2026-10-21 05:26:03.927
cmvho6ygj0006zglaqrd5bwqi	Unicall (Hayot) ning Sirdaryodagi ofisi	Sirdaryo tumanidan yangi ofis topish va kadrlar masalasida gaplashish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:27:02.899	2026-10-21 05:27:02.899
cmvho860d0008zglaasaeggd8	BioSales (Sherbek) kadrlar masalasi	Kadrlar masalasida Sherbek va Said aka bilan gaplashish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:27:59.341	2026-10-21 05:27:59.341
cmvho9m54000azglaa7sgla7a	Startup Studio	Startup Studio masalasida aniq malumot olish, respublikadan ishni nimada toxtaganini aniqlash, Jasur aka bilan gaplashish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:29:06.904	2026-10-21 05:29:06.904
cmvhoauxt000czgla0ws2h3lz	Shahardagi ofislardan inventarni olib kelish	Argos va Xotin qizlar binosida qolgan mebellarni Yoshlar Markaziga qaytarish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:30:04.961	2026-10-21 05:30:04.961
cmvhocjgj000ezgla8wlcxb2a	Inventarizatsiya (tumanlarda IT Centerlar)	Tumanlardagi IT Centerlar narsalarini olib kelish yoki rezidentda bolsa tekshirish, aniq malumotni tayyorlash, konditsionerlarni yechishga usta topish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:31:23.395	2026-10-21 05:31:23.395
cmvhodiuo000gzglanjr55r09	Generator	Generator ishlashini tekshirish, usta topish va qancha xarajati borligini aniqlash, yoqilg'i olib kelish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:32:09.264	2026-10-21 05:32:09.264
cmvhoerpw000izgla5cgpbz4i	Omborxona	Yoshlar Markazi podvali ijaraga olsa boladimi aniqlash, malumotlarni respublikaga berish,	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:33:07.412	2026-10-21 05:33:07.412
cmvhofvjf000kzgla66up2cpe	Chiller	Chillerning aniq nimaga ishlamayotganini aniqlash, Bobur aka bilan gaplashib ishlatishga harakat qilish	TODO	MEDIUM	\N	\N	cmv2bodmw0002rolahmsodadr	cmv2bodmw0002rolahmsodadr	\N	\N	\N	2026-10-21 05:33:59.019	2026-10-21 05:33:59.019
cmv4s0fl80000a5lwgg17n16v	Leadows - Zero Risk Program	Shartnoma qilishi kerak $500k	TODO	HIGH	\N	\N	cmuzes3vc0000xtla8wbqchdd	cmuzes3vc0000xtla8wbqchdd	\N	\N	\N	2026-10-12 04:52:56.684	2026-10-12 04:52:56.684
cmv4stgda000ga5lwd8ngsgnt	Zero Risk - Call PRO MAX (Vohid ajnabiyga)	Kerakli hujjatlari hali taqdim qilinmagan	IN_PROGRESS	MEDIUM	2026-10-19 00:00:00	\N	cmv2bp4vp0003rola7do43qov	cmv2bp4vp0003rola7do43qov	\N	\N	\N	2026-10-12 05:15:30.718	2026-10-12 05:15:30.718
cmv4szu2e000oa5lwpcmfycfx	Khalil Qureshi USA - BPO ochishi kerak	Guidance berildi waiting for him to find Carrier company	IN_PROGRESS	MEDIUM	2026-10-16 00:00:00	\N	cmuzes3vc0000xtla8wbqchdd	cmuzes3vc0000xtla8wbqchdd	\N	\N	\N	2026-10-12 05:20:28.406	2026-10-12 05:20:28.406
cmv4sw6kq000ia5lwiq64whyj	Humovoices - Zero Risk	Hamma hujjatlari hal bo'gan, O'zining pastavchigida gap qolgan, lotga qo'yib bersa tamom, hal bo'ladi! Ohirgi bosqichda turipti	DONE	HIGH	2026-10-16 00:00:00	2026-10-21 04:40:42.255	cmv2bp4vp0003rola7do43qov	cmv2bp4vp0003rola7do43qov	\N	\N	\N	2026-10-12 05:17:37.994	2026-10-21 04:40:42.272
cmv4szqh8000ma5lwqekf32ug	Mebel City	Rezidentlikka topshirish kerak! Ofisga borish kerak, Dilafruz opa ( +998972450088) bilan gaplashib! Texno Parkda!	DONE	HIGH	2026-10-12 00:00:00	2026-10-21 04:40:56.082	cmv2bp4vp0003rola7do43qov	cmuzes3vc0000xtla8wbqchdd	\N	\N	\N	2026-10-12 05:20:23.756	2026-10-21 04:40:56.083
\.


--
-- Data for Name: TaskAttachment; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."TaskAttachment" (id, "fileName", "fileUrl", "fileSize", "taskId", "createdAt") FROM stdin;
\.


--
-- Data for Name: TaskComment; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."TaskComment" (id, content, "taskId", "userId", "createdAt") FROM stdin;
cmv4t665h000ra5lwix750o2e	tushunarli	cmv4szqh8000ma5lwqekf32ug	cmuzes3vc0000xtla8wbqchdd	2026-10-12 05:25:24.005
cmv4t6tad000ta5lw5fpggp07	Alloh rozi bo'lsin! 🤲	cmv4szqh8000ma5lwqekf32ug	cmv2bp4vp0003rola7do43qov	2026-10-12 05:25:53.989
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public."User" (id, name, email, password, "createdAt", "updatedAt", "isActive", "position", "approvalStatus", role, surname) FROM stdin;
cmuuxfsjg0000j0laygff2joj	ProRabotka Admin	admin@prorabotka.local	$2b$12$uzuH35S35fBNVBqSHP5IO.Nhha7DTvsxTCS95kuYMM3RF5WegSTbW	2026-10-05 07:27:09.628	2026-10-05 07:27:09.628	t	Director	APPROVED	\N	\N
cmuzes3vc0000xtla8wbqchdd	Ali Farhodov	alifarhodovofficial@gmail.com	$2b$12$kc/XjR2HiHO.d0RCT9n3HOf79ahTHThQ07x0.VboVjXurfJOOhv3q	2026-10-08 10:43:42.36	2026-10-08 10:44:38.071	t	Project Manager	APPROVED	Project Manager	Farhodov
cmv2b9tzy0001rolatmqauxtv	Xurshid Suvonov	x.suvonov@outsource.gov.uz	$2b$12$1aAgDXJqYsVy5C7dqHqxa.iC5q072D6vZmYnMOmrfEA4B9AgUvK0q	2026-10-10 11:28:49.438	2026-10-10 11:44:03.578	t	Director	APPROVED	Director	Suvonov
cmv2bodmw0002rolahmsodadr	Umrzoq Valiyev	o.valiev@outsource.gov.uz	$2b$12$Vmk50l6bFhop2FA9OAXPquj2CqpNOQXmpLc42luSIpjcL3SO6EFD.	2026-10-10 11:40:08.072	2026-10-10 11:44:05.415	t	Infrastructure Manager	APPROVED	Infrastructure Manager	Valiyev
cmv2bp4vp0003rola7do43qov	Axror Narzullayev	a.narzullayev@outsource.gov.uz	$2b$12$0KbMtSJ0QtsBRxyqGZxXV.mx30IVRo37lqV36aeZR54Iue27aw7CK	2026-10-10 11:40:43.381	2026-10-10 11:44:07.242	t	Startup Manager	APPROVED	Startup Manager	Narzullayev
cmv2bpoc10004rolaett3uzd8	Mirbobjon Gaybullayev	m.gaybullayev@outsource.gov.uz	$2b$12$MnTrQZPLNh/OvbiEGCEYIerN5nSuEWL5tLimKgwMyxzvxzPjPfL5S	2026-10-10 11:41:08.593	2026-10-10 11:44:08.69	t	Startup Manager	APPROVED	Startup Manager	Gaybullayev
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: prorabotka
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8a9ac12d-e2c9-46d9-8cae-d466561c4e76	787a305dcb13cfe917619758b136d12477ddfaa83c28151b41c9a9e6232ace9a	2026-10-05 06:58:05.310065+00	20261005065805_init	\N	\N	2026-10-05 06:58:05.307421+00	1
5290bb40-91fb-4c0b-bc13-47e517f74852	5d3056649649c0fd295aab080d5aefa8ad64b78e151a70694749d8cadcce5938	2026-10-05 07:01:34.725753+00	20261005070134_core_models	\N	\N	2026-10-05 07:01:34.704485+00	1
ffc20d82-3cbe-4410-8b52-b652f38ffb6b	c344a712d75e1aaa1f6c17f1e1d1341bf21e827f3e249e2f28c873b9ba8bc246	2026-10-06 08:34:41.065048+00	20261006083441_infrastructure_capacity	\N	\N	2026-10-06 08:34:41.063765+00	1
98d515b9-1975-47cf-8e78-c2a6ba4e79fb	d5e0adb3c88b361d7b6b233ddf8159482d6e08575dd20c8d26e813b39b29f61b	2026-10-06 08:56:44.202224+00	20261006085644_document_storage	\N	\N	2026-10-06 08:56:44.200221+00	1
4e1a478e-1fba-467a-a78d-51421913b223	f41120cf829895151c59c1c35b8caab4402ff282aa36b926b1543bba1cf5daf2	2026-10-06 10:51:16.745901+00	20261006105116_user_registration_approval	\N	\N	2026-10-06 10:51:16.743252+00	1
29e604e2-7b13-4f8a-961a-749890af0324	b91429dede8b4e5fef3bf24350c29fad340f0627e001b1faedb2935698c5e799	2026-10-08 11:16:09.075527+00	20261008111609_add_outreach	\N	\N	2026-10-08 11:16:09.06555+00	1
a17184e2-a9ec-444e-b615-1b0c2aca0db1	dd9b7d2fbb9e2c130e6a3bc2566eca28f5501492bd5f121ead71c60845ba4742	2026-10-10 12:38:37.991015+00	20261010123837_startup_profiles_funding	\N	\N	2026-10-10 12:38:37.981861+00	1
600f0496-44e1-427e-98a0-28ade547d360	a84ea8d0a25c92524481cab4868b19c328609f5a65e8219c6bbfef1d6e79d36c	2026-10-21 04:41:45.781805+00	20261021044145_add_talents	\N	\N	2026-10-21 04:41:45.768474+00	1
\.


--
-- Name: ActivityLog ActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: Document Document_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY (id);


--
-- Name: Folder Folder_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Folder"
    ADD CONSTRAINT "Folder_pkey" PRIMARY KEY (id);


--
-- Name: Infrastructure Infrastructure_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Infrastructure"
    ADD CONSTRAINT "Infrastructure_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: OutreachCampaign OutreachCampaign_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."OutreachCampaign"
    ADD CONSTRAINT "OutreachCampaign_pkey" PRIMARY KEY (id);


--
-- Name: QuarterReport QuarterReport_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."QuarterReport"
    ADD CONSTRAINT "QuarterReport_pkey" PRIMARY KEY (id);


--
-- Name: Resident Resident_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Resident"
    ADD CONSTRAINT "Resident_pkey" PRIMARY KEY (id);


--
-- Name: Space Space_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Space"
    ADD CONSTRAINT "Space_pkey" PRIMARY KEY (id);


--
-- Name: StartupFunding StartupFunding_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."StartupFunding"
    ADD CONSTRAINT "StartupFunding_pkey" PRIMARY KEY (id);


--
-- Name: Startup Startup_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Startup"
    ADD CONSTRAINT "Startup_pkey" PRIMARY KEY (id);


--
-- Name: TalentLanguage TalentLanguage_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TalentLanguage"
    ADD CONSTRAINT "TalentLanguage_pkey" PRIMARY KEY (id);


--
-- Name: TalentSkill TalentSkill_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TalentSkill"
    ADD CONSTRAINT "TalentSkill_pkey" PRIMARY KEY (id);


--
-- Name: Talent Talent_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Talent"
    ADD CONSTRAINT "Talent_pkey" PRIMARY KEY (id);


--
-- Name: TaskAttachment TaskAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TaskAttachment"
    ADD CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY (id);


--
-- Name: TaskComment TaskComment_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Document_infrastructureId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Document_infrastructureId_idx" ON public."Document" USING btree ("infrastructureId");


--
-- Name: Document_residentId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Document_residentId_idx" ON public."Document" USING btree ("residentId");


--
-- Name: Document_startupId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Document_startupId_idx" ON public."Document" USING btree ("startupId");


--
-- Name: Document_talentId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Document_talentId_idx" ON public."Document" USING btree ("talentId");


--
-- Name: Infrastructure_inventoryNo_key; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE UNIQUE INDEX "Infrastructure_inventoryNo_key" ON public."Infrastructure" USING btree ("inventoryNo");


--
-- Name: QuarterReport_residentId_year_quarter_key; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE UNIQUE INDEX "QuarterReport_residentId_year_quarter_key" ON public."QuarterReport" USING btree ("residentId", year, quarter);


--
-- Name: Resident_tin_key; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE UNIQUE INDEX "Resident_tin_key" ON public."Resident" USING btree (tin);


--
-- Name: StartupFunding_startupId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "StartupFunding_startupId_idx" ON public."StartupFunding" USING btree ("startupId");


--
-- Name: StartupFunding_type_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "StartupFunding_type_idx" ON public."StartupFunding" USING btree (type);


--
-- Name: TalentLanguage_language_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "TalentLanguage_language_idx" ON public."TalentLanguage" USING btree (language);


--
-- Name: TalentLanguage_talentId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "TalentLanguage_talentId_idx" ON public."TalentLanguage" USING btree ("talentId");


--
-- Name: TalentSkill_name_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "TalentSkill_name_idx" ON public."TalentSkill" USING btree (name);


--
-- Name: TalentSkill_talentId_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "TalentSkill_talentId_idx" ON public."TalentSkill" USING btree ("talentId");


--
-- Name: Talent_fullName_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Talent_fullName_idx" ON public."Talent" USING btree ("fullName");


--
-- Name: Talent_position_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Talent_position_idx" ON public."Talent" USING btree ("position");


--
-- Name: Talent_status_idx; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE INDEX "Talent_status_idx" ON public."Talent" USING btree (status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: prorabotka
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: ActivityLog ActivityLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."ActivityLog"
    ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Document Document_folderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES public."Folder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_infrastructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_infrastructureId_fkey" FOREIGN KEY ("infrastructureId") REFERENCES public."Infrastructure"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_spaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES public."Space"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_startupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES public."Startup"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_talentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES public."Talent"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Document Document_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Document"
    ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Folder Folder_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Folder"
    ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Folder"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Folder Folder_spaceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Folder"
    ADD CONSTRAINT "Folder_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES public."Space"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Infrastructure Infrastructure_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Infrastructure"
    ADD CONSTRAINT "Infrastructure_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public."OutreachCampaign"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OutreachCampaign OutreachCampaign_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."OutreachCampaign"
    ADD CONSTRAINT "OutreachCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QuarterReport QuarterReport_documentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."QuarterReport"
    ADD CONSTRAINT "QuarterReport_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES public."Document"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: QuarterReport QuarterReport_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."QuarterReport"
    ADD CONSTRAINT "QuarterReport_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StartupFunding StartupFunding_startupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."StartupFunding"
    ADD CONSTRAINT "StartupFunding_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES public."Startup"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TalentLanguage TalentLanguage_talentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TalentLanguage"
    ADD CONSTRAINT "TalentLanguage_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES public."Talent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TalentSkill TalentSkill_talentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TalentSkill"
    ADD CONSTRAINT "TalentSkill_talentId_fkey" FOREIGN KEY ("talentId") REFERENCES public."Talent"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskAttachment TaskAttachment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TaskAttachment"
    ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskComment TaskComment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskComment TaskComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assigneeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_infrastructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_infrastructureId_fkey" FOREIGN KEY ("infrastructureId") REFERENCES public."Infrastructure"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Task Task_startupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: prorabotka
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES public."Startup"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict zNEJqCp8t1P3PW4VQTE0snjlRznaC7NFMXzlUglXo9NCbIc3T0b42yqoall4nUy

