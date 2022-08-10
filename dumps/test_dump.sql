--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

-- Started on 2022-08-11 02:11:33

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 25322)
-- Name: test; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA test;


ALTER SCHEMA test OWNER TO postgres;

--
-- TOC entry 211 (class 1255 OID 33676)
-- Name: gen_random_tags(text, integer); Type: FUNCTION; Schema: test; Owner: postgres
--

CREATE FUNCTION test.gen_random_tags(p_nickname text, p_count integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
	inserted_rows int;
begin
	insert into test.tags(name, sort_order, creator)
    select substr(md5(random()::text), 0, 10) as name, (random() * 100)::integer % 2 as sort_order, t1.uid
      from generate_series(1, p_count), test.users t1
	 where t1.nickname = p_nickname;
	  
	get diagnostics inserted_rows = ROW_COUNT;
	return inserted_rows;
end;
$$;


ALTER FUNCTION test.gen_random_tags(p_nickname text, p_count integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 206 (class 1259 OID 25337)
-- Name: tags; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.tags (
    id integer NOT NULL,
    creator uuid NOT NULL,
    name character varying(40) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE test.tags OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 25341)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: test; Owner: postgres
--

CREATE SEQUENCE test.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE test.tags_id_seq OWNER TO postgres;

--
-- TOC entry 3023 (class 0 OID 0)
-- Dependencies: 207
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: test; Owner: postgres
--

ALTER SEQUENCE test.tags_id_seq OWNED BY test.tags.id;


--
-- TOC entry 208 (class 1259 OID 25343)
-- Name: users; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.users (
    uid uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    nickname character varying(30) NOT NULL
);


ALTER TABLE test.users OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 25347)
-- Name: users_tags; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.users_tags (
    user_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE test.users_tags OWNER TO postgres;

--
-- TOC entry 2874 (class 2604 OID 25350)
-- Name: tags id; Type: DEFAULT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.tags ALTER COLUMN id SET DEFAULT nextval('test.tags_id_seq'::regclass);


--
-- TOC entry 2877 (class 2606 OID 25352)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 2882 (class 2606 OID 25354)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- TOC entry 2884 (class 2606 OID 25356)
-- Name: users_tags users_tags_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users_tags
    ADD CONSTRAINT users_tags_pkey PRIMARY KEY (user_id, tag_id);


--
-- TOC entry 2878 (class 1259 OID 25357)
-- Name: u_idx_tags_name; Type: INDEX; Schema: test; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_tags_name ON test.tags USING btree (name);


--
-- TOC entry 2879 (class 1259 OID 25358)
-- Name: u_idx_users_email; Type: INDEX; Schema: test; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_email ON test.users USING btree (email);


--
-- TOC entry 2880 (class 1259 OID 25359)
-- Name: u_idx_users_nickname; Type: INDEX; Schema: test; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_nickname ON test.users USING btree (nickname);


--
-- TOC entry 2885 (class 2606 OID 25360)
-- Name: tags tags_creator_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.tags
    ADD CONSTRAINT tags_creator_fkey FOREIGN KEY (creator) REFERENCES test.users(uid) ON DELETE CASCADE;


--
-- TOC entry 2886 (class 2606 OID 25365)
-- Name: users_tags users_tags_tag_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users_tags
    ADD CONSTRAINT users_tags_tag_fkey FOREIGN KEY (tag_id) REFERENCES test.tags(id) ON DELETE CASCADE;


--
-- TOC entry 2887 (class 2606 OID 25370)
-- Name: users_tags users_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users_tags
    ADD CONSTRAINT users_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES test.users(uid) ON DELETE CASCADE;


-- Completed on 2022-08-11 02:11:33

--
-- PostgreSQL database dump complete
--

