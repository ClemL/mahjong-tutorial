import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LESSONS, lessonIndex } from "@/tutorial/lessons";
import { LESSON_CONTENT } from "@/components/lessons/LessonContent";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = LESSONS[lessonIndex(slug)];
  return lesson ? { title: lesson.title, description: lesson.summary } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = lessonIndex(slug);
  const lesson = LESSONS[index];
  const Content = LESSON_CONTENT[slug];
  if (!lesson || !Content) notFound();
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  return (
    <article className="lesson">
      <header className="page-head">
        <p className="eyebrow">
          <Link href="/learn">Lesson {index + 1} of {LESSONS.length}</Link>
        </p>
        <h1>{lesson.title}</h1>
        <p className="lede">{lesson.summary}</p>
      </header>
      <Content />
      <nav className="pager" aria-label="Lessons">
        {prev ? (
          <Link className="pager__link" href={`/learn/${prev.slug}`}>
            <span className="pager__dir">‹ Previous</span>
            <span className="pager__title">{prev.title}</span>
          </Link>
        ) : null}
        <Link className="pager__link pager__link--next" href={next ? `/learn/${next.slug}` : "/example"}>
          <span className="pager__dir">Next ›</span>
          <span className="pager__title">{next ? next.title : "The example hand"}</span>
        </Link>
      </nav>
    </article>
  );
}
