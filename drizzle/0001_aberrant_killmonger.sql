CREATE TABLE "t3-social_follow" (
	"followerId" varchar(255) NOT NULL,
	"followingId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "t3-social_follow_followerId_followingId_pk" PRIMARY KEY("followerId","followingId")
);
--> statement-breakpoint
ALTER TABLE "t3-social_follow" ADD CONSTRAINT "t3-social_follow_followerId_t3-social_user_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."t3-social_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t3-social_follow" ADD CONSTRAINT "t3-social_follow_followingId_t3-social_user_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."t3-social_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "follow_follower_id_idx" ON "t3-social_follow" USING btree ("followerId");--> statement-breakpoint
CREATE INDEX "follow_following_id_idx" ON "t3-social_follow" USING btree ("followingId");--> statement-breakpoint
ALTER TABLE "t3-social_like" DROP COLUMN "id";