--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

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
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    creator uuid NOT NULL,
    name character varying(40) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    nickname character varying(30) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_tags (
    user_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.users_tags OWNER TO postgres;

--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: users_tags users_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_pkey PRIMARY KEY (user_id, tag_id);


--
-- Name: u_idx_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_tags_name ON public.tags USING btree (name);


--
-- Name: u_idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_email ON public.users USING btree (email);


--
-- Name: u_idx_users_nickname; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_nickname ON public.users USING btree (nickname);


--
-- Name: tags tags_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_creator_fkey FOREIGN KEY (creator) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: users_tags users_tags_tag_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_tag_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: users_tags users_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

