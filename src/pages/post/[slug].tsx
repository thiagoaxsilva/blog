import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <img src={post.data.banner.url} alt="" />
      <div className={`${styles.content} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.heading}>
          <time>
            <img src="" alt="" />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </time>
          <p>
            <img src="" alt="" />
            {post.data.author}
          </p>
          <p>
            <img src="" alt="" />4 min
          </p>
        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.postContent}>
            <p className={styles.contentHeading}>{content.heading}</p>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 1 }
  );
  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  return { props: { post } };
};
