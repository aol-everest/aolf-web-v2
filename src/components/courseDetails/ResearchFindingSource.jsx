/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-irregular-whitespace */
import classNames from "classnames";
import { useState } from "react";
import { Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";

export const ResearchFindingSource = () => {
  const [selectedTab, setSelectedTab] = useState("detail");

  const toggleModalTab = (tab) => () => {
    setSelectedTab(tab);
  };

  return (
    <>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={classNames({ active: selectedTab === "detail" })}
            onClick={toggleModalTab("detail")}
          >
            RESEARCH ON SUDARSHAN KRIYA YOGA
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({ active: selectedTab === "depression" })}
            onClick={toggleModalTab("depression")}
          >
            RESEARCH ON SUDARSHAN KRIYA YOGA FOR DEPRESSION
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={selectedTab}>
        <TabPane tabId="1">
          {selectedTab === "detail" ? (
            <>
              <>
                <h3>
                  Research on Sudarshan Kriya Yoga -{" "}
                  <em>Physical &amp; Mental Health benefits</em>
                </h3>
                <p>
                  Sudarshan Kriya and accompanying breathing practices, referred
                  to collectively as SKY and taught through the Art of Living
                  Foundation worldwide, have been found to enhance brain,
                  hormone, immune and cardiovascular system function. Published
                  research shows that SKY significantly reduces stress,
                  depression, anxiety and Post-Traumatic Stress Disorder (PTSD),
                  and significantly increases well-being both mentally and
                  physically. Research also demonstrates that the effects of SKY
                  reach all the way down to the molecular level, to our DNA.
                </p>
                <p>
                  Over 100 independent studies conducted on four continents and
                  published in peer reviewed journals, have demonstrated a
                  comprehensive range of benefits from SKY practice.
                </p>
                <h3 className="research_significance">
                  <strong>
                    <em>
                      Significant Health Benefits Documented in Independent
                      Research and published in Peer Reviewed Journals
                    </em>
                  </strong>
                </h3>
                <h1>
                  <strong>Mental Well-being:​</strong>
                </h1>
                <h2>
                  <strong>
                    Restoration and Enhancement of Vibrant Mental Health:
                  </strong>
                </h2>
                <ul className="significant_benifits">
                  <li>
                    Relieves anxiety [1-10]&amp; depression [2, 4, 8-19], PTSD
                    symptomsS[3, 15, 16, 20]and stress levels [4, 6, 17, 18,
                    21-23]
                    <ul className="signficance_subtitle">
                      <li>
                        significant reductions in anxiety are found in many
                        populations, including a 73% response rate and 41%
                        remission rate in individuals for whom medication and
                        psychotherapy treatments had failed <strong>[1]</strong>
                        .
                      </li>
                      <li>
                        Multiple studies demonstrate that depressed patients who
                        learned SKY experienced a 68-73% remission rate within
                        one month.
                      </li>
                      <li>
                        Significant reductions in PTSD symptoms were found in
                        4-6 weeks and were sustained at 6 months[15] and one
                        year, with no follow-up after 1 month{" "}
                        <strong>[3, 15]</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>Reduces impulsivity and addictive behaviors [24, 25]</li>
                  <li>Improved emotional regulation [1, 17, 18, 26-28]</li>
                  <li>
                    Increased levels of self-esteem, optimism, joviality (e.g.
                    joy, happiness, energy), serenity, life satisfaction and
                    quality of life [4, 5, 15, 18, 28-30]
                  </li>
                </ul>
                <h2>
                  <strong>Enhanced brain functioning: [13, 14, 22, 31]</strong>
                </h2>
                <ul className="significant_benifits">
                  <li>Increased mental focus / heightened awareness[31]</li>
                  <li>Faster recovery from stressful stimuli [22]</li>
                </ul>
                <h2>
                  <strong>Improved Quality of Sleep:[32]</strong>
                </h2>
                <ul className="significant_benifits">
                  <li>
                    Restoration of time spend in deep restful stages (stages III
                    and IV) of sleep.
                  </li>
                </ul>
                <h1>
                  <strong>Physical Well-being:</strong>
                </h1>
                <h2>
                  <strong>Enhanced biochemical status:</strong>
                </h2>
                <ul className="significant_benifits">
                  <li>
                    <strong>Reduced biochemical markers of stress: </strong>
                    <span className="font-normal">
                      cortisol<strong> [2, 33, 34],</strong> corticotrophin
                      <strong> [2] </strong>blood lactate{" "}
                      <strong> [35],</strong>ACTH <strong> [2], </strong>and
                      plasma malondialdehyde (MDA)
                      <strong> [2, 36, 37]</strong>
                    </span>
                    <ul className="signficance_subtitle">
                      <li>
                        For example, blood lactate levels in police cadets who
                        did not learn SKY were 4 times higher than their
                        classmates who were randomized to learn SKY, suggesting
                        a greatly increased resilience to stress in SKY
                        practitioners.
                      </li>
                      <li>
                        Since stressful physiological responses negatively
                        impact immune, cardiovascular and endocrine systems, as
                        well as mental health, this has significant implications
                        for wellness <strong>[16]</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Increased biomarkers of well-being [38]
                    <ul className="signficance_subtitle">
                      <li>
                        Significant increases (33%) in the well-being hormone
                        prolactin levels in depressed patients with low
                        prolactin levels from the very first session.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Increased levels of antioxidant enzymes{" "}
                    <strong>
                      (glutathione, catalase, and superoxide dismutase) [6, 35,
                      39]
                    </strong>
                    <ul className="signficance_subtitle">
                      <li>
                        Antioxidants protect us from many diseases and rapid
                        aging.
                      </li>
                    </ul>
                  </li>
                  <h2>
                    <strong>Enhanced immune function:{/*<strong*/}</strong>
                  </h2>
                  <ul className="significant_benifits">
                    <li>
                      <strong>
                        Improved immune cell counts in apparently healthy
                        individuals [21, 25]{" "}
                      </strong>
                      <ul className="signficance_subtitle">
                        <li>
                          Some documented within three weeks (neutrophils,
                          lymphocytes, platelet count)<strong> [21]</strong>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>
                        Improved immune cell counts in health compromised
                        individuals seen in 12 weeks{" "}
                      </strong>
                      (Natural Killer Cells) <strong> [25]</strong>
                    </li>
                    <li>
                      <strong>
                        Rapid changes to gene (the building blocks of DNA)
                        expression [39-41]{" "}
                      </strong>
                      <ul className="signficance_subtitle">
                        <li>
                          SKY induced changes in the expression of genes in
                          white blood cells (our immune cells) within two hours
                          of starting the practice. This was 4-fold more than
                          simple exercise and relaxation used as the control
                          condition in the same study participants[40] .
                        </li>
                        <li>
                          Long-term effects of SKY on expression of 11 genes
                          related to oxidative stress, DNA damage, cell cycle
                          control, and cell death suggests that the long-term
                          benefits of SKY may be mediated in part by regulation
                          of gene expressions <strong>[39]</strong> .
                        </li>
                      </ul>
                    </li>
                  </ul>
                  <h2>
                    <strong>
                      <strong>
                        Enhanced Cardiovascular and Respiratory Function:
                      </strong>
                    </strong>
                  </h2>
                  <ul className="significant_benifits">
                    <li>
                      <strong>
                        <strong>Reduced heart rate</strong> in both healthy and
                        health compromised individuals{" "}
                        <strong>[42-44][6]</strong>
                      </strong>
                    </li>
                    <li>
                      <strong>
                        <strong>
                          <strong>Reduced blood pressure</strong>{" "}
                        </strong>
                      </strong>
                      <ul className="signficance_subtitle">
                        <li>
                          <strong>
                            In both healthy and health compromised individuals{" "}
                            <strong>[6, 37, 42, 43]</strong>
                          </strong>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>
                        Improved cholesterol and triglyceride (lipid) profiles:
                        [36][6, 21]{" "}
                      </strong>
                      <ul className="signficance_subtitle">
                        <li>
                          Sometimes seen as early as 3 weeks, with no change in
                          diet [36]
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>
                        improved respiratory function: [3, 43-46]{" "}
                      </strong>
                      <ul className="signficance_subtitle">
                        <li>
                          respiration rate dropped by 5% in 1 week{" "}
                          <strong>[3]</strong> and 15% in 12 weeks{" "}
                          <strong> [45]</strong>
                        </li>
                        <li>
                          increased lung (vital/forced vital) capacity{" "}
                          <strong>[43, 44, 46]</strong>
                        </li>
                      </ul>
                    </li>
                  </ul>
                  <p>
                    <strong>In Summary,</strong> Sudarshan Kriya uses specific
                    cyclical, rhythmic patterns of breath to bring the mind and
                    body into a relaxed, yet energized state. Its effects have
                    been studied in open and randomized trials, both in healthy
                    and health compromised populations.
                  </p>
                  <p className="mar-b-40">
                    Research suggests that SKY reduces depression, anxiety, PTSD
                    and stress.It has also been shown to curb addictive
                    behaviors and substance abuse. It significantly increases
                    feelings of well-being, optimism and mental focus and
                    improves emotion regulation. In addition, SKY is associated
                    with enhanced cardio-respiratory function, antioxidant
                    status and immune system function. The practice has even
                    been shown to impact gene expression at short and long term
                    periods, suggesting that the effects of SKY span all levels
                    of the physiology from the DNA within our cells to organ
                    systems. Viewed together, the wide range of documented
                    benefits suggest that SKY may be an efficient tool for
                    rapidly strengthening the mind-body complex.
                  </p>
                  <p>
                    <strong>References:</strong>
                  </p>
                </ul>
                <ol className="reasearch_reference">
                  <li>
                    Katzman, M.A., et al.,
                    <em>
                      {" "}
                      A multicomponent yoga-based, breath intervention program
                      as an adjunctive treatment in patients suffering from
                      Generalized Anxiety Disorder with or without
                      comorbidities.
                    </em>{" "}
                    International journal of yoga, 2012. <strong>5</strong>
                    (1): p. 57.
                  </li>
                  <li>
                    Vedamurthachar, A., et al.,{" "}
                    <em>
                      Antidepressant efficacy and hormonal effects of Sudarshana
                      Kriya Yoga (SKY) in alcohol dependent individuals.
                    </em>{" "}
                    Journal of affective disorders, 2006. <strong>94</strong>
                    (1): p. 249-253.
                  </li>
                  <li>
                    Seppälä, E.M., et al.,{" "}
                    <em>
                      Breathing‐Based Meditation Decreases Posttraumatic Stress
                      Disorder Symptoms in US Military Veterans: A Randomized
                      Controlled Longitudinal Study.
                    </em>{" "}
                    Journal of traumatic stress, 2014. <strong>27</strong>(4):
                    p. 397-405.
                  </li>
                  <li>
                    Kjellgren, A., et al.,{" "}
                    <em>
                      Wellness through a comprehensive yogic breathing program -
                      a controlled pilot trial.
                    </em>{" "}
                    BMC Complement Altern Med, 2007. <strong>7</strong>: p. 43.
                  </li>
                  <li>
                    Sureka, P., et al.,{" "}
                    <em>
                      Effect of Sudarshan Kriya on male prisoners with non
                      psychotic psychiatric disorders: A randomized control
                      trial.
                    </em>{" "}
                    Asian journal of psychiatry, 2014. <strong>12</strong>: p.
                    43-49.
                  </li>
                  <li>
                    Agte, V.V. and S.A.{" "}
                    <em>
                      Chiplonkar, Sudarshan kriya yoga for Improving Antioxidant
                      status and Reducing Anxiety in Adults.
                    </em>{" "}
                    Alternative &amp; Complementary Therapies, 2008.{" "}
                    <strong>14</strong>(2): p. 96-100.
                  </li>
                  <li>
                    Narnolia, P.K., et al.,{" "}
                    <em>
                      Effect of Sudarshan Kriya Yoga on Cardiovascular
                      Parameters and Comorbid Anxiety in Patients of
                      Hypertension.
                    </em>
                  </li>
                  <li>
                    Doria, S., et al.,{" "}
                    <em>
                      Anti-anxiety efficacy of Sudarshan Kriya Yoga in general
                      anxiety disorder: a multicomponent, yoga based, breath
                      intervention program for patients suffering from
                      generalized anxiety disorder with or without
                      comorbidities.
                    </em>{" "}
                    Journal of affective disorders, 2015. <strong>184</strong>:
                    p. 310-317.
                  </li>
                  <li>
                    Toschi-Dias, E., et al.,{" "}
                    <em>
                      Sudarshan Kriya Yoga improves cardiac autonomic control in
                      patients with anxiety-depression disorders.
                    </em>{" "}
                    Journal of Affective Disorders, 2017. <strong>214</strong>:
                    p. 74-80.
                  </li>
                  <li>
                    Sharma, A., et al.,{" "}
                    <em>
                      A breathing-based meditation intervention for patients
                      with major depressive disorder following inadequate
                      response to antidepressants: a randomized pilot study
                    </em>
                    . The Journal of clinical psychiatry, 2017.{" "}
                    <strong>78</strong>(1): p. e59.
                  </li>
                  <li>
                    Janakiramaiah, N., et al.,{" "}
                    <em>
                      Antidepressant efficacy of Sudarshan Kriya Yoga (SKY) in
                      melancholia: a randomized comparison with
                      electroconvulsive therapy (ECT) and imipramine.{" "}
                    </em>
                    Journal of affective disorders, 2000. <strong>57</strong>
                    (1): p. 255-259.
                  </li>
                  <li>
                    Janakiramaiah, N., Gangadhar, B.N., Naga Venkatesha Murthy,,
                    S. P.J., T.K., Subbakrishna, D.K., Meti, B.L., Raju, T.R.,,
                    and A. Vedamurthachar, Therapeutic efficacy of Sudarshan
                    Kriya Yoga (SKY) in dysthymic disorder. NIMHANS J., 1998.{" "}
                    <strong>17</strong>: p. 21-28.
                  </li>
                  <li>
                    Naga Venkatesha Murthy, P., et al.,{" "}
                    <em>
                      Normalization of P300 amplitude following treatment in
                      dysthymia.{" "}
                    </em>
                    Biological Psychiatry, 1997. <strong>42</strong>(8): p.
                    740-743.
                  </li>
                  <li>
                    Murthy, P.N.V., et al.,{" "}
                    <em>
                      P300 amplitude and antidepressant response to Sudarshan
                      Kriya Yoga (SKY).
                    </em>{" "}
                    Journal of affective disorders, 1998. <strong>50</strong>
                    (1): p. 45-48.
                  </li>
                  <li>
                    Descilo, T., et al.,{" "}
                    <em>
                      Effects of a yoga breath intervention alone and in
                      combination with an exposure therapy for post-traumatic
                      stress disorder and depression in survivors of the 2004
                      South-East Asia tsunami.
                    </em>{" "}
                    Acta Psychiatr Scand, 2010.<strong> 121</strong>(4): p.
                    289-300.
                  </li>
                  <li>
                    Martin, A.,{" "}
                    <em>
                      Multi-component yoga breath program for Vietnam veteran
                      post traumatic stress disorder: randomized controlled
                      trial.
                    </em>{" "}
                    Journal of Traumatic Stress Disorders &amp; Treatment, 2013.
                  </li>
                  <li>
                    Kharya, C., et al.,
                    <em>
                      {" "}
                      Effect of controlled breathing exercises on the
                      psychological status and the cardiac autonomic tone:
                      Sudarshan Kriya and Prana-Yoga.
                    </em>{" "}
                    Indian Journal of Physiology and Pharmacology, 2014.{" "}
                    <strong>58</strong>(3): p. 210-220.
                  </li>
                  <li>
                    Goldstein, M.R., et al.,{" "}
                    <em>
                      Improvements in well-being and vagal tone following a
                      yogic breathing-based life skills workshop in young
                      adults: Two open-trial pilot studies.{" "}
                    </em>
                    International journal of yoga, 2016.<strong> 9</strong>
                    (1): p. 20.
                  </li>
                  <li>
                    Carter, J., et al.,{" "}
                    <em>
                      Multi-component yoga breath program for Vietnam veteran
                      post traumatic stress disorder: randomized controlled
                      trial.
                    </em>{" "}
                    J Trauma Stress Disor Treat 2, 2013. 3: p. 2.
                  </li>
                  <li>
                    Walker III, J. and D. Pacik,
                    <em>
                      {" "}
                      Controlled Rhythmic Yogic Breathing as Complementary
                      Treatment for Post-Traumatic Stress Disorder in Military
                      Veterans: A Case Series.{" "}
                    </em>
                    Medical acupuncture, 2017. <strong>29</strong>(4): p.
                    232-238.
                  </li>
                  <li>
                    Subramanian, S., et al.,{" "}
                    <em>
                      Role of sudarshan kriya and pranayam on lipid profile and
                      blood cell parameters during exam stress: A randomized
                      controlled trial.{" "}
                    </em>
                    International journal of yoga, 2012.<strong> 5</strong>
                    (1): p. 21.
                  </li>
                  <li>
                    Chandra, S., et al.,{" "}
                    <em>
                      Mental stress: neurophysiology and its regulation by
                      Sudarshan Kriya Yoga.
                    </em>{" "}
                    International journal of yoga, 2017. <strong>10</strong>
                    (2): p. 67.
                  </li>
                  <li>
                    Kharya, C., et al.,{" "}
                    <em>
                      Effect of controlled breathing exercises on the
                      psychological status and the cardiac autonomic tone:
                      Sudarshan Kriya and Prana-Yoga.{" "}
                    </em>
                    Indian J Physiol Pharmacol, 2014. <strong>58</strong>(3): p.
                    210-220.
                  </li>
                  <li>
                    Ghahremani, D.G., et al.,{" "}
                    <em>
                      Effects of the Youth Empowerment Seminar on impulsive
                      behavior in adolescents.{" "}
                    </em>
                    Journal of Adolescent Health, 2013.
                  </li>
                  <li>
                    Kochupillai, V., et al.,{" "}
                    <em>
                      Effect of rhythmic breathing (Sudarshan Kriya and
                      Pranayam) on immune functions and tobacco addiction.
                    </em>{" "}
                    Annals of the New York Academy of Sciences, 2005.{" "}
                    <strong>1056</strong>(1): p. 242-252.
                  </li>
                  <li>
                    Gootjes, L., I.H. Franken, and J.W.{" "}
                    <em>
                      Van Strien, Cognitive Emotion Regulation in Yogic
                      Meditative Practitioners.{" "}
                    </em>
                    Journal of Psychophysiology, 2011. <strong>25</strong>(2):
                    p. 87-94.
                  </li>
                  <li>
                    Katzman, M.A., et al.,{" "}
                    <em>
                      A multicomponent yoga-based, breath intervention program
                      as an adjunctive treatment in patients suffering from
                      generalized anxiety disorder with or without
                      comorbidities.
                    </em>{" "}
                    Int J Yoga, 2012.<strong> 5</strong>(1): p. 57-65.
                  </li>
                  <li>
                    Newman, R., O. Yim, and D. Shaenfeld,
                    <em>
                      {" "}
                      Gender and Ethnicity: Are they associated with Diffrential
                      Outcomes in a comprehensive Social-Emotional-Learning
                      Program?{" "}
                    </em>
                    under review.
                  </li>
                  <li>
                    Jyotsna, V.P., et al.,{" "}
                    <em>
                      Comprehensive yogic breathing program improves quality of
                      life in patients with diabetes.
                    </em>{" "}
                    Indian journal of endocrinology and metabolism, 2012.{" "}
                    <strong>16</strong>
                    (3): p. 423.
                  </li>
                  <li>
                    Warner, A. and K. Hall,
                    <em>
                      {" "}
                      Psychological and Spiritual Well-being of Women with
                      Breast Cancer Participating in the Art of Living Program,
                      in Psychology of Cancer
                    </em>
                    , N.L. Hicks and R.E. Warren, Editors. 2012, Nova Science
                    Publishers, Inc.
                  </li>
                  <li>
                    Bhatia, M., et al.,
                    <em>
                      {" "}
                      Electrophysiologic evaluation of Sudarshan Kriya: an EEG,
                      BAER, P300 study.{" "}
                    </em>
                    Indian journal of physiology and pharmacology, 2003.{" "}
                    <strong>47</strong>(2): p. 157-163.
                  </li>
                  <li>
                    Sulekha, S., et al.,{" "}
                    <em>
                      Evaluation of sleep architecture in practitioners of
                      Sudarshan Kriya yoga and Vipassana meditation*
                    </em>
                    . Sleep and Biological Rhythms, 2006.<strong> 4</strong>
                    (3): p. 207-214.
                  </li>
                  <li>
                    Kumar, N., et al.,{" "}
                    <em>
                      Randomized controlled trial in advance stage breast cancer
                      patients for the effectiveness on stress marker and pain
                      through Sudarshan Kriya and Pranayam.
                    </em>{" "}
                    Indian journal of palliative care, 2013. <strong>19</strong>
                    (3): p. 180.
                  </li>
                  <li>
                    Mulla, Z.R. and Vedamuthachar,{" "}
                    <em>
                      Impact of a Sudarshan Kriya-based occupational stress
                      management intervention on physiological and psychological
                      outcomes.{" "}
                    </em>
                    Management and Labour Studies, 2014. <strong>39</strong>
                    (4): p. 381-395.
                  </li>
                  <li>
                    Sharma, H., et al.,{" "}
                    <em>
                      Sudarshan Kriya practitioners exhibit better antioxidant
                      status and lower blood lactate levels.
                    </em>{" "}
                    Biological Psychology, 2003. <strong>63</strong>(3): p.
                    281-291.
                  </li>
                  <li>
                    <em>
                      Agte, V.V. and K. Tarwadi, Sudarshan kriya yoga for
                      treating type 2 diabetes: a preliminary study.{" "}
                    </em>
                    Alternative &amp; Complementary Therapies, 2004.{" "}
                    <strong>10</strong>(4): p. 220-222.
                  </li>
                  <li>
                    Agte, V.V., M.U. Jahagirdar, and K.V. Tarwadi,{" "}
                    <em>
                      The effects of Sudarshan Kriya Yoga on some physiological
                      and biochemical parameters in mild hypertensive patients.
                    </em>{" "}
                    Indian J Physiol Pharmacol, 2011.<strong> 55</strong>(2): p.
                    183-187.
                  </li>
                  <li>
                    Janakiramaiah, N., et al.,{" "}
                    <em>
                      Therapeutic efficacy of Sudarshan Kriya Yoga (SKY) in
                      dysthymic disorder.{" "}
                    </em>
                    Nimhans Journal, 1998. 16(1): p. 21-28.
                  </li>
                  <li>
                    Sharma, H., et al.,{" "}
                    <em>
                      Gene expression profiling in practitioners of Sudarshan
                      Kriya.{" "}
                    </em>
                    Journal of psychosomatic research, 2008. 64(2): p. 213-218.
                  </li>
                  <li>
                    Qu, S., et al.,{" "}
                    <em>
                      Rapid gene expression changes in peripheral blood
                      lymphocytes upon practice of a comprehensive yoga program.{" "}
                    </em>
                    PLoS One, 2013. 8(4): p. e61910.
                  </li>
                  <li>
                    Ayyildiz, D. and K.Y. Arga, Hypothesis:
                    <em>
                      {" "}
                      Are there molecular signatures of yoga practice in
                      peripheral blood mononuclear cells?{" "}
                    </em>
                    Omics: a journal of integrative biology, 2017. 21(7): p.
                    426-428.
                  </li>
                  <li>
                    Somwanshi S. D., H.S.M., Adgaonkar B. D., Kolpe D. V.,
                    <em>
                      {" "}
                      Effect of Sudarshankriya Yoga on Cardiorespiratory
                      Parameters. International Journal of Recent Trends in
                      Science And Technology, 2013. 8(1).
                    </em>
                  </li>
                  <li>
                    Kale, J.S., R.R. Deshpande, and N.T. Katole,{" "}
                    <em>
                      The effect of Sudarshan Kriya Yoga (SKY) on cardiovascular
                      and respiratory parameters.
                    </em>{" "}
                    Int J Med Sci Public Health, 2016. 5(10): p. 2091-4.
                  </li>
                  <li>
                    Bodi, S.G., et al.,
                    <em>
                      {" "}
                      Improvement in lung function with a unique breathing
                      technique: Sudarshan kriya yoga (SKY).
                    </em>{" "}
                    Chest, 2008. 134(4): p. 144P.
                  </li>
                  <li>
                    Somwanshi, S., et al.,
                    <em>
                      {" "}
                      Effect of Sudarshankriya Yoga on Cardiorespiratory
                      Parameters
                    </em>
                    . Int J Recent Trends in Science and Technology, 2013. 8(1):
                    p. 62-66.
                  </li>
                  <li>
                    Chavhan, D.B.,{" "}
                    <em>
                      The Effect Of Sudarshan Kriya and Bhastrika Pranayama on
                      Endurance Capacity in Kho-Kho Players
                    </em>{" "}
                    International Multidisciplinary Research Journal, 2103.
                    6(1).
                  </li>
                </ol>
                <h2>For more information: </h2>
                <p>
                  For more information on SKY research, please visit:
                  research.artofliving.org
                </p>
                <p>
                  If you would like more information on our SKY wellness
                  programs and/or our programs for special needs populations,
                  please contact us at:
                </p>
                <p>
                  For North and South America:{" "}
                  <a href="mailto:research@artofliving.org ">
                    research@artofliving.org{" "}
                  </a>
                </p>
                <p>
                  For Europe:{" "}
                  <a href="mailto:research@aoluniversity.org">
                    research@aoluniversity.org
                  </a>
                </p>
                <p>
                  For Asia:{" "}
                  <a href="mailto:research@ssiar.org ">research@ssiar.org </a>
                </p>
              </>
            </>
          ) : null}
        </TabPane>
        <TabPane tabId="2">
          {selectedTab === "depression" ? (
            <>
              <>
                <h4>
                  <span className="tw-text-sm">
                    <strong>
                      Summary of Independent Research findings for Sudarshan
                      Kriya Yoga in the treatment of Depression
                    </strong>
                  </span>
                </h4>
                <p>
                  More than a dozen published studies have documented
                  significant relief from depression in individuals who learned
                  and practiced Sudarshan Kriya and accompanying breathing
                  techniques (SKY).{" "}
                  <strong>
                    These studies have demonstrated a 67-73% success rate in
                    relief from depression, regardless of the severity of
                    depression{" "}
                  </strong>
                  [1-6].
                </p>
                <p>
                  <strong>
                    These results are experienced rapidly, often within 3-4
                    weeks
                  </strong>{" "}
                  [1, 2, 4, 5, 7, 8]. And unlike conventional treatments, there
                  is uniform rapid relief from depression with SKY practice,
                  regardless of how long a person has been suffering from
                  clinical depression or the degree to which brain ‘dysfunction’
                  (e.g. abnormal EEG patterns or hormone levels)[4, 5] is found
                  in the depressed individual.
                </p>
                <p>
                  Further, SKY has been found to significantly stem ‘the blues’;
                  the non-clinical melancholy that mainstream people commonly
                  experience.[9, 10]
                </p>
                <h4>
                  <span className="tw-text-sm">
                    <strong>Highlights of Research Findings:</strong>
                  </span>
                </h4>
                <p>
                  <span className="tw-text-xs">
                    <strong>
                      Remission from depression is experienced rapidly.
                    </strong>
                  </span>
                </p>
                <p>Substantial relief was experienced in three weeks.[5, 8]</p>
                <p>
                  By one month, individuals[6] were considered to be in
                  remission. [1, 2, 4-7]
                </p>
                <p>
                  At three months, the individuals remained asymptomatic and
                  stable, which demonstrates results persisted and cannot be
                  considered a placebo effect. [3-6, 11] (Placebo effects in
                  depression wane after 4 weeks).
                </p>
                <h4>
                  <span className="tw-text-base">
                    <strong>
                      SKY produced highly beneficial biological effects on brain
                      and hormone function.
                    </strong>
                  </span>
                </h4>
                <p>
                  The P300 ERP EEG brainwave pattern and NREM brainwave pattern,
                  which measure electrical brainwave activity and are abnormal
                  in many depressed people, returned to the normal range by
                  ninety days. [4, 5]
                </p>
                <p>Return to healthier hormone levels</p>
                <p>
                  Plasma prolactin, a well being hormone which is believed to be
                  a key factor in producing depression relief, increased
                  significantly after the very first SKY session.[3]
                </p>
                <p>
                  Levels of plasma cortisol (the stress hormone) decreased
                  significantly after three weeks.[2]
                </p>
                <h4>
                  <span className="tw-text-sm">
                    <strong>As Effective as Anti-Depressant Medication</strong>
                  </span>
                </h4>
                <div
                  className="media-element file-default"
                  data-fid={49115}
                  data-media-element={1}
                  height={307}
                  width={420}
                >
                  <picture>
                    <source
                      srcSet="https://www.artofliving.org/sites/www.artofliving.org/files/styles/original_image/public/wysiwyg_imageupload/depression-comparison_0.png.webp?itok=wnKOKnUM"
                      type="image/webp"
                    />
                    <source srcSet="https://www.artofliving.org/sites/www.artofliving.org/files/styles/original_image/public/wysiwyg_imageupload/depression-comparison_0.png?itok=wnKOKnUM" />
                    <img
                      loading="lazy"
                      width={420}
                      height={307}
                      className="media-element file-default"
                      srcSet
                      src="/sites/www.artofliving.org/files/styles/original_image/public/wysiwyg_imageupload/depression-comparison_0.png?itok=wnKOKnUM"
                    />
                  </picture>
                </div>
                <p>
                  In a comparison study, SKY was statistically as effective as
                  the conventional anti-depressant medication[1] . Yet, in
                  contrast to the usual treatments for depression, SKY is
                  natural and free of unwanted side effects. It is
                  self-administered and self-empowering. It can greatly reduce
                  doctor and hospital caseloads, thus making SKY cost effective
                  and staff effective as well [3].
                </p>
                <h4>
                  <span className="tw-text-sm">
                    <strong>
                      Chairman, Department Psychiatry, at NIMHANS reported “SKY
                      has remarkable therapeutic effects”.
                    </strong>
                  </span>
                </h4>
                <p>
                  Dr. Janakiramaiah, M.D., Ph.D., D.P.H., medical researcher,
                  and Chair of Psychiatry at the National Institute of Mental
                  Health and Neurosciences (N.I.M.H.A.N.S.) of India has
                  conducted several of these studies. He concluded that
                  Sudarshan Kriya has “remarkable therapeutic effects”[3] and
                  “is clinically feasible and effective. It has the potential to
                  become a first-line treatment of dysthymic [chronic, mild
                  depression] patients and possibly in mild and moderate forms
                  of major depressive disorder."[1, 3]
                </p>
              </>
            </>
          ) : null}
        </TabPane>
      </TabContent>
    </>
  );
};
