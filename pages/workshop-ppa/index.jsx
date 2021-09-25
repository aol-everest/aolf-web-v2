import React from "react";
import { api } from "@utils";
import { useGlobalAlertContext } from "@contexts";
import { ALERT_TYPES } from "@constants";
import { NextSeo } from "next-seo";

const successMessage = () => {
  return (
    <p class="course-join-card__text">
      We have received your request to withhold your grant of rights.
    </p>
  );
};

const TAndCWorkshop = ({ token }) => {
  const { showAlert } = useGlobalAlertContext();
  const handleClick = async () => {
    try {
      await api.post({
        path: "waiveOffUserGrants",
        body: { waiveGrants: true },
        token,
      });
      showAlert(ALERT_TYPES.SUCCESS_ALERT, {
        children: successMessage,
        title: "Confirmed",
      });
    } catch (error) {
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: error.message,
      });
    }
  };
  return (
    <main className="aol_mainbody">
      <NextSeo title="TERMS OF SERVICE FOR USERS" />
      <section className="workshops_wraper">
        <article className="container">
          <div className="tandc">
            <center>
              <h4>Art of Living Foundation – USA</h4>

              <h5>ART OF LIVING TERMS OF SERVICE FOR USERS</h5>
              <br />
            </center>
            <br />
            <p>
              This Program Participant Agreement is entered into by and
              between Art of Living Foundation on behalf of itself and its
              affiliates, group companies, related entities, and licensors (the
              “Organization”), and you as a participant in one or more programs
              of learning administered by the Organization (the “program” or
              “programs”), or, for our applicable programs for children, you as
              parent or guardian of a child under the age of 18 (also referred
              to as a “minor”), on behalf of such child or minor. By registering
              for or participating in a program, you accept and agree to be
              bound and abide by this Program Participation Agreement, as well
              as our website{" "}
              <a
                href="https://www.artofliving.org/us-en/terms-use"
                target="_blank"
              >
                Terms of Use
              </a>{" "}
              and our{" "}
              <a
                href="https://www.artofliving.org/us-en/privacy-policy"
                target="_blank"
              >
                Privacy Policy
              </a>
              , incorporated herein by reference (collectively, the
              “Agreement”). For clarity, all provisions in the Terms of Use that
              apply to your use of the website will also apply to your
              participation in a program. This Agreement is for an indefinite
              term and you understand and agree that you are bound by it, and if
              you do not agree to this Agreement, you may not access our website
              or register for or participate in any programs.
            </p>
            <p>
              If you are a parent or guardian entering into this Agreement on
              behalf of a child or minor, all references to the first person,
              e.g. “I”, “me”, “my”, etc., or to the “participant”, shall be
              applicable to such child or minor (except with respect to the
              reference to minimum age, which is applicable to you only) and you
              agree by accepting this Agreement and using our website and
              participating in our programs, that you will ensure the child or
              minor is made aware of and understands this Agreement, and that
              you are personally responsible for ensuring obligations herein are
              adhered to by the child or minor. Additional terms may apply for
              our programs for children and where applicable will be included in
              the registration form.
            </p>
            <p>
              I understand that any benefits derived from this program depend
              upon the extent of my participation. I accept full responsibility
              for the outcome of taking the program and I willingly agree to
              follow all instructions and participate fully.
            </p>
            <p>
              I will not record or disclose the content of the program to anyone
              nor will I repurpose the content of the program in any manner,
              except as otherwise set forth in this Agreement. I will not
              attempt to instruct others in the techniques used in the program
              unless and until I have received the relevant Organization teacher
              training and have been certified by the Organization to teach this
              program.
            </p>
            <p>
              I acknowledge that I am not authorized to release the contents of
              any programs or any parts thereof provided to me online,
              electronically or in person by the Organization and/or another
              program participant to any third party without the prior written
              authorization of the Organization. I confirm that the
              Organization’s techniques and exercises constitute private and
              confidential information and I will neither (1) share this
              information with or teach this information to others except with
              the prior written permission of the Organization, nor (2) practice
              the techniques and exercises outside of the Organization program
              environment except as otherwise instructed by my Organization
              teacher. I further acknowledge that the contents of Organization
              programs constitute the intellectual property of the Organization
              which is protected worldwide by the relevant copyright law and
              other applicable intellectual property laws, and that I may be
              liable under applicable law for any unlawful use, disclosure,
              copying, recording, modification or creation of derivative works
              of such contents except as explicitly authorized by the
              Organization.
            </p>
            <p>
              Notwithstanding anything stated to the contrary in the foregoing,
              nothing contained herein shall apply to any confidential
              information, program content or technique of Organization which is
              or subsequently becomes readily available to the public other than
              by breach by the receiving party of the undertakings in this User
              Agreement; or is approved for release by written authorization of
              the Organization.
            </p>
            <p>
              I grant unrestricted rights to the Organization to use my image,
              name, voice and likeness for written, audio and/or visual
              presentations on behalf of the Organization. I understand that the
              written, audio and/or visual presentations may be used in print,
              broadcast and online promotions to advance the purposes of the
              Organization around the world. If I wish to withhold or withdraw
              this grant of rights, I may do so by{" "}
              <span onClick={handleClick}>clicking here</span> or writing to the
              Organization at support@us.artofliving.org.
            </p>
            <p>
              This Agreement is governed by the laws of Commonwealth of Virginia
              and shall be subject to the exclusive jurisdiction of the Courts
              in Commonweath of Virginia. Any failure to enforce any provision
              of this agreement shall not constitute a waiver thereof or of any
              other provision hereof.
            </p>
            <strong>Refund Policy</strong>
            <p>
              You will have thirty (30) days from the date you purchase any
              non-subscription based products or services governed by this
              Agreement to cancel and receive a refund, less a cancellation fee
              of $50.00 to cover our administrative costs (“Cancellation
              Period”). Notwithstanding the foregoing, once a non-subscription
              based program begins, your purchase of that program is
              non-refundable, even if the Cancellation Period has not yet
              expired. You can cancel by contacting
              app.support@us.artofliving.org. After the Cancellation Period has
              ended, or upon commencement of the program, your purchase is
              non-refundable. If you cancel a month to month subscription-based
              product or service, which includes Digital, Journey Premium, Basic
              or Plus, you will charged through the end of the month in which
              you cancel. If the Silent Retreat waiver is used and Journey
              Premium or Journey Plus is cancelled within 12 months of joining,
              the remaining membership balance will be charged to the card on
              file.
            </p>
            <strong>
              Waiver of Liability, Assumption of Risk, Indemnity Agreement, and
              Release
            </strong>
            <p>
              As a condition for, and in consideration of the right to
              participate in any way in any program provided by the Organization
              (as defined above), I, for myself, my personal representatives,
              assigns, heirs, and next of kin acknowledge and agree as follows:
            </p>
            <ol type="1">
              <li>
                The nature of Organization programs requires me to be qualified,
                in good health, and in proper physical condition to participate
                in such programs. If, at any time, I believe or am advised that
                the conditions of an Organization program may be unsafe for me,
                I will immediately discontinue further participation.
              </li>
              <li>
                Organization programs involve risk of personal injury which may
                be caused by my own actions or inactions, the actions or
                inactions of others participating in the programs, the
                conditions in which the programs take place, or the acts or
                omissions of others, and that there may be other risks or social
                and economic losses either not known to me or not readily
                foreseeable at this time (“Risks”);
              </li>
              <li>
                I fully accept and assume all Risks and all responsibility for
                losses, costs, and damages I may incur as a result of my
                participation in Organization programs.
              </li>
            </ol>
            <p>
              I hereby release, discharge, and covenant not to sue or hold
              responsible in any manner whatsoever, the Organization, its
              affiliates, administrators, directors, agents, officers, members,
              volunteers, and employees, other participants, officials, owners
              and lessees of premises on which the programs are conducted (the
              “Released Parties”), from all liability, claims, demands, losses,
              or damages on my account caused, or alleged to be caused, in whole
              or in part by the acts, omissions or negligence of any of the
              Released Parties and I further agree that if, despite this release
              and waiver of liability, assumption of risk, and indemnity
              agreement I, or anyone on my behalf, makes a claim against any of
              the Released Parties, I will indemnify, save, and hold harmless
              each of them from any litigation expenses, attorney fees, loss,
              liability, damage, or cost which may be incurred as the result of
              such claim.
            </p>
            <p>
              <b>
                By agreeing to this Waiver, I acknowledge that I am at least 18
                years of age, have carefully read and fully understand this
                waiver of liability, assumption of risk, indemnity agreement and
                release, understand that I have given up substantial rights by
                agreeing to this waiver, have agreed to it freely and without
                any inducement or assurance of any nature, and intend this to be
                a complete and unconditional release of all liability to the
                greatest extent allowed by law and agree that if any portion of
                this agreement is held to be invalid, the balance,
                notwithstanding, shall continue in full force and effect.
              </b>
            </p>
          </div>
        </article>
      </section>
    </main>
  );
};

export default TAndCWorkshop;
