--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

-- Started on 2022-08-11 02:06:55

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
-- TOC entry 210 (class 1255 OID 33681)
-- Name: gen_random_tags(text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.gen_random_tags(p_nickname text, p_count integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
	inserted_rows int;
begin
	insert into public.tags(name, sort_order, creator)
    select substr(md5(random()::text), 0, 10) as name, (random() * 100)::integer % 2 as sort_order, t1.uid
      from generate_series(1, p_count), public.users t1
	 where t1.nickname = p_nickname;
	  
	get diagnostics inserted_rows = ROW_COUNT;
	return inserted_rows;
end;
$$;


ALTER FUNCTION public.gen_random_tags(p_nickname text, p_count integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 204 (class 1259 OID 17105)
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
-- TOC entry 203 (class 1259 OID 17103)
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
-- TOC entry 3024 (class 0 OID 0)
-- Dependencies: 203
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 202 (class 1259 OID 17097)
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
-- TOC entry 205 (class 1259 OID 25291)
-- Name: users_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users_tags (
    user_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.users_tags OWNER TO postgres;

--
-- TOC entry 2874 (class 2604 OID 17108)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 2881 (class 2606 OID 17111)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 2879 (class 2606 OID 17102)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- TOC entry 2884 (class 2606 OID 25295)
-- Name: users_tags users_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_pkey PRIMARY KEY (user_id, tag_id);


--
-- TOC entry 2882 (class 1259 OID 25306)
-- Name: u_idx_tags_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_tags_name ON public.tags USING btree (name);


--
-- TOC entry 2876 (class 1259 OID 25289)
-- Name: u_idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_email ON public.users USING btree (email);


--
-- TOC entry 2877 (class 1259 OID 25290)
-- Name: u_idx_users_nickname; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX u_idx_users_nickname ON public.users USING btree (nickname);


--
-- TOC entry 2885 (class 2606 OID 25307)
-- Name: tags tags_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_creator_fkey FOREIGN KEY (creator) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- TOC entry 2886 (class 2606 OID 25312)
-- Name: users_tags users_tags_tag_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_tag_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 2887 (class 2606 OID 25317)
-- Name: users_tags users_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users_tags
    ADD CONSTRAINT users_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


-- Completed on 2022-08-11 02:06:55

--
-- PostgreSQL database dump complete
--

