/**
 * Copyright (c) 2025 Moa Torres
 * @license MIT
 */

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const timelineData = [
  {
    year: 2010,
    title: 'Communication Studies',
    description: 'Began studying Social Communication in Pernambuco, Brazil.',
    meta: [
      { label: 'Focus', value: 'Creative Direction' },
      { label: 'Hobby', value: 'Photography' },
    ],
  },
  {
    year: 2012,
    title: 'First Assistant Director',
    description: '1st Assistant Director at Luni Produções, Recife.',
    meta: [
      {
        label: 'Key Projects',
        value:
          "TV series for Globo Broadcast 'The Sung Kingdom of Luiz Gonzaga'. Lula Queiroga's 'Todo Dia É O Fim Do Mundo' album launch and national tour.",
      },
    ],
  },
  {
    year: 2014,
    title: 'Independent Producer',
    description: 'Directed the 2014 FIFA Fan Fest Recife amid a crisis in the Town Hall.',
    meta: [
      { label: 'Collaboration', value: 'International Team' },
      { label: 'Focus', value: 'Live Experience' },
    ],
  },
  {
    year: 2016,
    title: 'Operations Manager',
    description: 'Joined Odebrecht as Operations Manager at Maracanã, Rio de Janeiro.',
    meta: [
      {
        label: 'Major Events',
        value:
          "Managed operations for Coldplay's 'A Head Full of Dreams' concert (66,000 attendees). Oversaw Health & Safety for athletes and dignitaries at the British House during the Rio 2016 Olympics.",
      },
    ],
  },
  {
    year: 2018,
    title: 'International Move',
    description:
      "Relocated to the UK to work as a Project Manager at one of London's leading and most inclusive live experience agencies.",
    meta: [
      { label: 'Key Customers', value: 'Facebook' },
      { label: 'Cities', value: 'Amsterdam, Buenos Aires, London, Oslo' },
    ],
  },
  {
    year: 2020,
    title: 'Technical Lead',
    description:
      'Founded an independent IT consultancy office, providing technical guidance and digital solutions for national and international clients.',
    meta: [
      {
        label: 'Expertise',
        value: 'Strategy, Design Thinking, Digital Transformation',
      },
      { label: 'Clients', value: 'Tech Startups, Cultural Institutions, Global Brands, NGOs' },
    ],
  },
  {
    year: 2022,
    title: 'Computer Science',
    description: 'Enrolled in the University of London to pursue a BSc in Computer Science.',
    meta: [
      { label: 'Specialization', value: 'AI & Machine Learning' },
      { label: 'Interests', value: 'Data Science, Ethical Tech, Infrastructure' },
    ],
  },
  {
    year: 2024,
    title: 'Content Creation',
    description:
      'Writing on culture, politics, and science, engaging with audiences across multiple platforms.',
    meta: [
      { label: 'Medium', value: 'Academic Papers, Online Journals' },
      { label: 'Themes', value: 'Societal Innovation, Critical Thinking' },
    ],
  },
]

const cities = ['Recife', 'Rio de Janeiro', 'São Paulo', 'London']

export default function AboutPage() {
  const [visibleCity, setVisibleCity] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let lastActiveIndex = -1

    const handleScroll = () => {
      if (!contentRef.current) return

      const sections = contentRef.current.querySelectorAll('[data-year-index]')
      const scrollPosition = window.scrollY + window.innerHeight

      sections.forEach((section) => {
        const index = section.getAttribute('data-year-index')
        if (!index) return

        const sectionTop = (section as HTMLElement).offsetTop
        const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          const currentIndex = Number.parseInt(index)
          if (currentIndex !== lastActiveIndex) {
            lastActiveIndex = currentIndex

            // Set visible city based on the current index
            const cityIndex = currentIndex % cities.length
            setVisibleCity(cities[cityIndex])
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    // Set initial visible city
    setVisibleCity(cities[0])

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="px-4 pb-32">
      <div className="fixed top-1/2 right-8 md:right-12 text-xs text-muted-foreground opacity-50 transform -rotate-90 origin-right pointer-events-none">
        {visibleCity && <div>{visibleCity}</div>}
      </div>

      <div className="grid grid-cols-12 gap-4 py-24 md:py-32">
        <div className="col-span-12 mb-16">
          <h1 className="text-[8vw] md:text-[6vw] font-bold leading-none tracking-tight mb-12">
            Moa Torres
          </h1>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-6 md:col-start-7 space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The truth that often goes unnoticed is how closely related the skills of connecting
                people in live, interactive settings and navigating technical challenges in software
                development are—both demand precision, coordination with multiple stakeholders, and
                the ability to operate under pressure.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="aspect-[3/4] bg-muted overflow-hidden">
            <Image
              src="/moa-torres-by-will-stuetz.png"
              alt="Portrait of Moa Torres"
              width={400}
              height={800}
              className="object-cover w-full h-full"
            />
            {/* <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
              Photo
            </div> */}
          </div>
        </div>
      </div>

      <div ref={contentRef} className="mt-32">
        {timelineData.map((item, index) => (
          <motion.section
            key={item.year}
            data-year-index={index}
            className="mb-48 scroll-mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="grid grid-cols-12 gap-4">
              <div
                className={`col-span-12 ${
                  index % 2 === 0 ? 'md:col-span-6' : 'md:col-span-6 md:col-start-7'
                }`}
              >
                <h2 className="text-[8vw] md:text-[4vw] font-bold leading-none tracking-tighter">
                  {item.year}
                </h2>
              </div>

              <div
                className={`col-span-12 ${
                  index % 2 === 0 ? 'md:col-span-6 md:col-start-7' : 'md:col-span-6 md:-mt-18'
                }`}
              >
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {item.meta && (
                    <div
                      className={`grid gap-8 mt-12 ${
                        item.meta.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}
                    >
                      {item.meta.map((metaItem, metaIndex) => (
                        <div key={metaIndex}>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            {metaItem.label}
                          </p>
                          <p className="text-sm">{metaItem.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </section>
  )
}
